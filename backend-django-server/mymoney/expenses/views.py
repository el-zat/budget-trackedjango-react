from rest_framework import viewsets
from .serializers import CategorySerializer, ExpenseSerializer, MyExpenseSerializer
from .models import Category, Expense, MyExpense
from django.views.generic import TemplateView


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ExpenseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


class MyExpenseViewSet(viewsets.ModelViewSet):
    queryset = MyExpense.objects.all()
    serializer_class = MyExpenseSerializer


class FrontendAppView(TemplateView):
    template_name = "index.html" 
