from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from expenses.views import CategoryViewSet, ExpenseViewSet, MyExpenseViewSet
from users.views import (UserViewSet, EmailVerificationViewSet, UserLoginAPIView,
                         UserProfileViewSet, UserRegistrationView, UserLogoutAPIView)


router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'myexpenses', MyExpenseViewSet)
router.register(r'users', UserViewSet)
router.register(r'emailverifications', EmailVerificationViewSet)
router.register(r'userprofile', UserProfileViewSet, basename='userprofile')


def home(request):
    return HttpResponse("Home page")

urlpatterns = [
    path('', home, name='home'),

    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path('api/login/', UserLoginAPIView.as_view(), name='user-login'),
    path('api/registration/', UserRegistrationView.as_view(), name='user-registration'),
    path('api/logout/', UserLogoutAPIView.as_view(), name='user-logout'),

]
