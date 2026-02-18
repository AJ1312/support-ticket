from django.db import models


class Ticket(models.Model):
    """Support ticket model with all constraints enforced at the database level."""

    # Category choices
    CATEGORY_BILLING = 'billing'
    CATEGORY_TECHNICAL = 'technical'
    CATEGORY_ACCOUNT = 'account'
    CATEGORY_GENERAL = 'general'
    CATEGORY_CHOICES = [
        (CATEGORY_BILLING, 'Billing'),
        (CATEGORY_TECHNICAL, 'Technical'),
        (CATEGORY_ACCOUNT, 'Account'),
        (CATEGORY_GENERAL, 'General'),
    ]

    # Priority choices
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CRITICAL = 'critical'
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    ]

    # Status choices
    STATUS_OPEN = 'open'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_RESOLVED = 'resolved'
    STATUS_CLOSED = 'closed'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_CLOSED, 'Closed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_GENERAL,
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title}"
