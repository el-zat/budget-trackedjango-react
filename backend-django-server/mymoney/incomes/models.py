from django.db import models
from datetime import date
from django.conf import settings


class IncomeCategory(models.Model):
    CATEGORY_CHOICES = [
        ('salary', 'Salary'),
        ('freelance', 'Freelance'),
        ('investment', 'Investment'),
        ('business', 'Business'),
        ('gift', 'Gift'),
        ('bonus', 'Bonus'),
        ('child', 'Child support'),
        ('other', 'Other'),
    ]
    name = models.CharField(max_length=128, choices=CATEGORY_CHOICES, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.get_name_display()

    class Meta:
        verbose_name = 'Income Category'
        verbose_name_plural = 'Income Categories'


class Income(models.Model):
    FREQUENCY_CHOICES = [
        ('once', 'One-time'),
        ('regular', 'Regular'),
    ]
    
    name = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    received_date = models.DateField(default=date.today)
    category = models.ForeignKey(to=IncomeCategory, on_delete=models.CASCADE)
    source = models.CharField(max_length=256, null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='once')
    is_recurring = models.BooleanField(default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='user_incomes')

    def __str__(self):
        return f"{self.name} | Amount: {self.amount} | Category: {self.category.get_name_display()}"

    def get_amount_for_date(self, target_date):
        """Get the effective amount for a given date, considering amount changes."""
        amount_change = self.amount_changes.filter(
            effective_date__lte=target_date
        ).order_by('-effective_date').first()
        
        if amount_change:
            return amount_change.new_amount
        return self.amount

    class Meta:
        verbose_name = 'Income'
        verbose_name_plural = 'Incomes'
        ordering = ['-received_date']


class IncomeAmountChange(models.Model):
    """Tracks amount changes for recurring incomes with effective dates."""
    income = models.ForeignKey(
        Income, 
        on_delete=models.CASCADE, 
        related_name='amount_changes'
    )
    new_amount = models.DecimalField(max_digits=10, decimal_places=2)
    effective_date = models.DateField()
    note = models.CharField(max_length=256, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.income.name}: €{self.new_amount} from {self.effective_date}"

    class Meta:
        verbose_name = 'Income Amount Change'
        verbose_name_plural = 'Income Amount Changes'
        ordering = ['-effective_date']
        constraints = [
            models.UniqueConstraint(
                fields=['income', 'effective_date'],
                name='unique_income_effective_date'
            )
        ]

