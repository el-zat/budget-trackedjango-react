from rest_framework import viewsets, status, generics, permissions
from .serializers import (UserSerializer, EmailVerificationSerializer, UserLoginSerializer, 
                          UserProfileSerializer, UserRegistrationSerializer)                   
from .models import User, EmailVerification
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, login, logout, authenticate


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class EmailVerificationViewSet(viewsets.ModelViewSet):
    queryset = EmailVerification.objects.all()
    serializer_class = EmailVerificationSerializer
    

class UserLoginAPIView(APIView):
    permission_classes = []  # или AllowAny

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        login_data = serializer.validated_data.get('login')
        password = serializer.validated_data.get('password')

        user = authenticate(request, username=login_data, password=password)
        if not user:
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=login_data)
                user = authenticate(request, username=user_obj.username, password=password)
                if user is None:
                    return Response({'success': False, 'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
                if not user.is_active:
                    return Response({'success': False, 'error': 'Account inactive'}, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                return Response({'success': False, 'error': 'User not found. No account? Sign up!'}, status=status.HTTP_404_NOT_FOUND)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'success': True, 'username': user.username})
        else:
            return Response({'success': False, 'error': 'Login failed!'}, status=status.HTTP_401_UNAUTHORIZED)


class UserLogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'success': True, 'message': 'You have successfully logged out.'}, status=status.HTTP_200_OK)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
