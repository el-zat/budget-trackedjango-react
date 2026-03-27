from rest_framework import serializers
from .models import Category, Expense, MyExpense, RecurringExpense


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
        fields = ['id', 'name', 'description', 'price', 'quantity', 'payment_date', 'bill', 'category', 'is_recurring']


class RecurringExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringExpense
        fields = ['id', 'name', 'description', 'price', 'quantity', 'category', 'frequency', 
                  'start_date', 'end_date', 'next_occurrence', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
