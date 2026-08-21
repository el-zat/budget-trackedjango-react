from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Income, IncomeCategory, IncomeAmountChange
from .serializers import IncomeSerializer, IncomeCategorySerializer, IncomeAmountChangeSerializer


class IncomeCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer
    permission_classes = [IsAuthenticated]


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).prefetch_related('amount_changes')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeAmountChangeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeAmountChangeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IncomeAmountChange.objects.filter(
            income__user=self.request.user
        )
    
    def perform_create(self, serializer):
        # Verify the income belongs to the user
        income = serializer.validated_data['income']
        if income.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add amount changes to your own incomes.")
        serializer.save()
