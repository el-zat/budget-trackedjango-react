from rest_framework import serializers
from .models import Category, Expense, MyExpense, RecurringExpense, RecurringExpensePriceChange


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'name', 'description', 'price', 'quantity', 'payment_date', 'bill', 'category']
    

class MyExpenseSerializer(serializers.ModelSerializer):
    is_recurring = serializers.SerializerMethodField()
    
    class Meta:
        model = MyExpense
        fields = ['id', 'name', 'description', 'price', 'quantity', 'payment_date', 'bill', 'category', 'frequency', 'is_recurring']
        read_only_fields = ['is_recurring']
    
    def get_is_recurring(self, obj):
        # Calculate is_recurring from frequency
        return obj.frequency != 'once'
    
    def create(self, validated_data):
        # Remove is_recurring if it was somehow included
        validated_data.pop('is_recurring', None)
        instance = super().create(validated_data)
        # The model's save() method will set is_recurring automatically
        return instance
    
    def update(self, instance, validated_data):
        # Remove is_recurring if it was somehow included
        validated_data.pop('is_recurring', None)
        instance = super().update(instance, validated_data)
        # The model's save() method will set is_recurring automatically
        return instance


class RecurringExpensePriceChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringExpensePriceChange
        fields = ['id', 'recurring_expense', 'new_price', 'effective_date', 'note', 'created_at']
        read_only_fields = ['created_at']


class RecurringExpenseSerializer(serializers.ModelSerializer):
    price_changes = RecurringExpensePriceChangeSerializer(many=True, read_only=True)
    
    class Meta:
        model = RecurringExpense
        fields = ['id', 'name', 'description', 'price', 'quantity', 'category', 'frequency', 
                  'start_date', 'end_date', 'next_occurrence', 'is_active', 'created_at', 'updated_at',
                  'price_changes']
        read_only_fields = ['created_at', 'updated_at']
