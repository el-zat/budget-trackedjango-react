from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from expenses.views import CategoryViewSet, ExpenseViewSet, MyExpenseViewSet


router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'myexpenses', MyExpenseViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
