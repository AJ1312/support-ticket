from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """Serializer for the Ticket model — handles all CRUD operations."""

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'category',
            'priority', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ClassifySerializer(serializers.Serializer):
    """Serializer for the /classify/ endpoint — accepts a description and returns
    LLM-suggested category and priority."""

    description = serializers.CharField(required=True)
