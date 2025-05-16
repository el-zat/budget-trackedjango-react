from django.contrib import admin
from expenses.models import Category, Expense, MyExpense


admin.site.register(Expense)
admin.site.register(Category)
admin.site.register(MyExpense)