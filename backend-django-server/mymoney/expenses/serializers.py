from rest_framework import serializers
from .models import Category, Expense, MyExpense


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'name', 'description', 'price', 'quantity', 'payment_date', 'bill', 'category']
    

class MyExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyExpense
        fields = ['id', 'name', 'description', 'price', 'quantity', 'payment_date', 'bill', 'category']
