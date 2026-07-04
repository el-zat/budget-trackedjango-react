from pyexpat.errors import messages
from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
from expenses.models import Category, Expense, MyExpense, RecurringExpense, RecurringExpensePriceChange
# from django.contrib.auth.models import User
import copy


@admin.action(description="Copy selected MyExpense")
def copy_myeexpense(modeladmin, request, queryset):
    count = 0
    for obj in queryset:
        copy_obj = copy.copy(obj)
        copy_obj.pk = None
        copy_obj.id = None
        copy_obj.save()
        count += 1
    modeladmin.message_user(
        request,
        f"Copied {count} inputs MyExpense.",
        messages.SUCCESS
    )

class MyExpenseAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'frequency', 'payment_date', 'category', 'is_recurring', 'user']
    list_filter = ['frequency', 'is_recurring', 'category']
    search_fields = ['name', 'description']
    actions = [copy_myeexpense]


class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'frequency', 'start_date', 'next_occurrence', 'is_active', 'user']
    list_filter = ['frequency', 'is_active', 'category']
    search_fields = ['name', 'description']


class RecurringExpensePriceChangeAdmin(admin.ModelAdmin):
    list_display = ['recurring_expense', 'new_price', 'effective_date', 'note', 'created_at']
    list_filter = ['effective_date']
    search_fields = ['recurring_expense__name', 'note']


admin.site.register(MyExpense, MyExpenseAdmin)
admin.site.register(RecurringExpense, RecurringExpenseAdmin)
admin.site.register(RecurringExpensePriceChange, RecurringExpensePriceChangeAdmin)
admin.site.register(Expense)
admin.site.register(Category)

# admin.site.unregister(User)
# admin.site.register(User, CustomUserAdmin)

