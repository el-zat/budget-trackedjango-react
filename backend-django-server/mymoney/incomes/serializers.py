from rest_framework import serializers
from .models import Income, IncomeCategory, IncomeAmountChange


class IncomeCategorySerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = IncomeCategory
        fields = ['id', 'name', 'display_name', 'description']


class IncomeAmountChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeAmountChange
        fields = ['id', 'income', 'new_amount', 'effective_date', 'note', 'created_at']
        read_only_fields = ['created_at']


class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.get_name_display', read_only=True)
    amount_changes = IncomeAmountChangeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Income
        fields = ['id', 'name', 'description', 'amount', 'received_date', 'category', 'category_name', 'source', 'frequency', 'is_recurring', 'user', 'amount_changes']
        read_only_fields = ['user']
