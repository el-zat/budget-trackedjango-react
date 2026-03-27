from django.db import models
from datetime import date
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'


class Expense(models.Model):
    name = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=0)
    payment_date = models.DateField(default=date.today)
    bill = models.ImageField(upload_to='expenses_images', blank=True)
    category = models.ForeignKey(to=Category, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} | Category: {self.category.name}"

    class Meta:
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'


class MyExpense(models.Model):
    name = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=0)
    payment_date = models.DateField(default=date.today)
    bill = models.ImageField(upload_to='expenses_images', blank=True)
    category = models.ForeignKey(to=Category, on_delete=models.CASCADE)
    is_recurring = models.BooleanField(default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name} | Category: {self.category.name}"

    class Meta:
        verbose_name = 'My Expense'
        verbose_name_plural = 'My Expenses'


class RecurringExpense(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    name = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(to=Category, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    start_date = models.DateField(default=date.today)
    end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField(default=date.today)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.frequency}) | Category: {self.category.name}"

    class Meta:
        verbose_name = 'Recurring Expense'
        verbose_name_plural = 'Recurring Expenses'

