import json
import logging

from django.conf import settings
from django.db.models import Count, Avg, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Ticket
from .serializers import TicketSerializer, ClassifySerializer

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────
# LLM classification prompt
# ────────────────────────────────────────────
CLASSIFY_PROMPT = """You are a support ticket classification assistant.

Given the following support ticket description, analyze it and determine:
1. The most appropriate **category** — must be exactly one of: billing, technical, account, general
2. The most appropriate **priority** — must be exactly one of: low, medium, high, critical
3. A brief, professional **response** (1-2 sentences) acknowledging the issue and letting the user know an admin will review it. Be specific to the issue described.

Guidelines for CATEGORY:
- "billing": Payment issues, invoices, charges, refunds, subscription pricing
- "technical": Bugs, errors, crashes, performance issues, feature not working, API problems
- "account": Login issues, password resets, profile changes, account access, permissions
- "general": General inquiries, feedback, feature requests, anything that doesn't fit above

Guidelines for PRIORITY:
- "critical": System down, data loss, security breach, complete inability to use the product
- "high": Major feature broken, significant impact on workflow, urgent deadline
- "medium": Feature partially broken, workaround exists, moderate inconvenience
- "low": Minor cosmetic issue, general question, feature request, no immediate impact

Guidelines for RESPONSE:
- Be professional and empathetic
- Acknowledge the specific issue briefly
- End with something like "Our admin team will review and get back to you shortly."
- Keep to 1-2 sentences max

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{{"suggested_category": "<category>", "suggested_priority": "<priority>", "ai_response": "<response>"}}

Ticket description:
{description}"""

# Valid values for validation
VALID_CATEGORIES = {'billing', 'technical', 'account', 'general'}
VALID_PRIORITIES = {'low', 'medium', 'high', 'critical'}


def classify_with_llm(description: str) -> dict:
    """Call Google Gemini to classify a ticket description.

    Returns a dict with suggested_category, suggested_priority, and ai_response.
    On any failure, returns sensible defaults so ticket submission is never blocked.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY not configured — skipping LLM classification")
        return {
            'suggested_category': 'general',
            'suggested_priority': 'medium',
            'ai_response': 'Thank you for reaching out. Our admin team will review your ticket and get back to you shortly.',
        }

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = CLASSIFY_PROMPT.format(description=description)
        response = model.generate_content(prompt)

        # Parse JSON from the response
        text = response.text.strip()
        # Handle markdown code fences if the model wraps the JSON
        if text.startswith('```'):
            text = text.split('\n', 1)[1]  # remove first line
            text = text.rsplit('```', 1)[0]  # remove last fence
            text = text.strip()

        result = json.loads(text)

        category = result.get('suggested_category', 'general').lower()
        priority = result.get('suggested_priority', 'medium').lower()
        ai_response = result.get('ai_response', 'Thank you for reaching out. Our admin team will review your ticket and get back to you shortly.')

        # Validate against allowed choices
        if category not in VALID_CATEGORIES:
            category = 'general'
        if priority not in VALID_PRIORITIES:
            priority = 'medium'

        return {
            'suggested_category': category,
            'suggested_priority': priority,
            'ai_response': ai_response,
        }

    except Exception as e:
        logger.error(f"LLM classification failed: {e}")
        return {
            'suggested_category': 'general',
            'suggested_priority': 'medium',
            'ai_response': 'Thank you for reaching out. Our admin team will review your ticket and get back to you shortly.',
        }


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for support tickets.

    list:   GET    /api/tickets/          — newest first, with filters
    create: POST   /api/tickets/          — create a ticket
    update: PATCH  /api/tickets/<id>/     — partial update
    stats:  GET    /api/tickets/stats/    — aggregated statistics
    classify: POST /api/tickets/classify/ — LLM classification
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    # Only allow list, create, partial_update (PATCH)
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy', 'stats']:
            from rest_framework.permissions import IsAdminUser
            permission_classes = [IsAdminUser]
        else:
            from rest_framework.permissions import AllowAny
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Generate an AI response on creation using Gemini, but respect user's category/priority."""
        description = serializer.validated_data.get('description', '')
        result = classify_with_llm(description)

        # Only save the ai_response — do NOT override user-selected category/priority
        serializer.save(
            ai_response=result.get('ai_response', ''),
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Return aggregated ticket statistics using DB-level aggregation."""
        qs = Ticket.objects.all()

        # Total tickets
        total_tickets = qs.count()

        # Open tickets
        open_tickets = qs.filter(status=Ticket.STATUS_OPEN).count()

        # Average tickets per day (DB-level)
        if total_tickets > 0:
            dates = qs.annotate(date=TruncDate('created_at')).values('date').distinct()
            num_days = dates.count()
            avg_tickets_per_day = round(total_tickets / max(num_days, 1), 1)
        else:
            avg_tickets_per_day = 0.0

        # Priority breakdown (DB-level aggregation)
        priority_qs = qs.values('priority').annotate(count=Count('id'))
        priority_breakdown = {
            'low': 0, 'medium': 0, 'high': 0, 'critical': 0,
        }
        for entry in priority_qs:
            priority_breakdown[entry['priority']] = entry['count']

        # Category breakdown (DB-level aggregation)
        category_qs = qs.values('category').annotate(count=Count('id'))
        category_breakdown = {
            'billing': 0, 'technical': 0, 'account': 0, 'general': 0,
        }
        for entry in category_qs:
            category_breakdown[entry['category']] = entry['count']

        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
        })

    @action(detail=False, methods=['post'], url_path='classify')
    def classify(self, request):
        """Send a description to the LLM and get back suggested category + priority + response."""
        serializer = ClassifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        description = serializer.validated_data['description']
        result = classify_with_llm(description)

        return Response(result, status=status.HTTP_200_OK)
