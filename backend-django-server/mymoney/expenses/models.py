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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name} | Category: {self.category.name}"

    class Meta:
        verbose_name = 'My Expense'
        verbose_name_plural = 'My Expenses'
