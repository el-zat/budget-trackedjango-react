from django.contrib import admin
from .models import Income, IncomeCategory, IncomeAmountChange


@admin.register(IncomeCategory)
class IncomeCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['name', 'amount', 'category', 'received_date', 'frequency', 'user']
    list_filter = ['category', 'frequency', 'received_date']
    search_fields = ['name', 'description', 'source']
    date_hierarchy = 'received_date'
    ordering = ['-received_date']


@admin.register(IncomeAmountChange)
class IncomeAmountChangeAdmin(admin.ModelAdmin):
    list_display = ['income', 'new_amount', 'effective_date', 'note', 'created_at']
    list_filter = ['effective_date']
    search_fields = ['income__name', 'note']
