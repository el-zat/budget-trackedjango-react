from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import CategorySerializer, ExpenseSerializer, MyExpenseSerializer
from .models import Category, Expense, MyExpense
from django.views.generic import TemplateView
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ExpenseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


class MyExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = MyExpenseSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MyExpense.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FrontendAppView(TemplateView):
    template_name = "index.html"
