from django.contrib import admin

from expenses.models import Category, Expense, MyExpense
from users.models import User

admin.site.register(Expense)
admin.site.register(Category)
admin.site.register(MyExpense)
admin.site.register(User)