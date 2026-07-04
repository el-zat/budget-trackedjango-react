from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CategorySerializer, ExpenseSerializer, MyExpenseSerializer, RecurringExpenseSerializer, RecurringExpensePriceChangeSerializer
from .models import Category, Expense, MyExpense, RecurringExpense, RecurringExpensePriceChange
from django.views.generic import TemplateView
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)


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


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return RecurringExpense.objects.filter(user=user).prefetch_related('price_changes')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecurringExpensePriceChangeViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringExpensePriceChangeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecurringExpensePriceChange.objects.filter(
            recurring_expense__user=self.request.user
        )
    
    def perform_create(self, serializer):
        # Verify the recurring expense belongs to the user
        recurring_expense = serializer.validated_data['recurring_expense']
        if recurring_expense.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add price changes to your own recurring expenses.")
        serializer.save()


class ReceiptScanView(APIView):
    """API endpoint for uploading a receipt image and getting parsed data with category suggestion."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response(
                {'error': 'No image uploaded. Please attach a receipt photo.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if image.content_type not in allowed_types:
            return Response(
                {'error': f'Unsupported format: {image.content_type}. Allowed: JPEG, PNG, WebP, GIF'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (max 10MB)
        if image.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 10 MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .receipt_scanner import scan_receipt
            result = scan_receipt(image)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        except Exception as e:
            import traceback
            logger.error(f'Receipt scan failed: {e}\n{traceback.format_exc()}')
            return Response(
                {'error': 'Failed to process receipt. Please try again or enter data manually.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FrontendAppView(TemplateView):
    template_name = "index.html"

