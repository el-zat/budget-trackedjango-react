from rest_framework import viewsets, status, generics, permissions
from .serializers import (UserSerializer, EmailVerificationSerializer, UserLoginSerializer, 
                          UserProfileSerializer, UserRegistrationSerializer)                   
from .models import User, EmailVerification
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model, logout


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class EmailVerificationViewSet(viewsets.ModelViewSet):
    queryset = EmailVerification.objects.all()
    serializer_class = EmailVerificationSerializer
    

class UserLoginAPIView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # username = serializer.validated_data['username']
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Return token or user data
                return Response({'success': True, 'username': user.username, 'email': user.email})
            else:
                return Response({'success': False, 'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


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
