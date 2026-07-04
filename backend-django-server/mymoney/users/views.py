from rest_framework import viewsets, status, generics, permissions
from rest_framework.permissions import AllowAny
from .serializers import (UserSerializer, EmailVerificationSerializer, UserLoginSerializer, 
                          UserProfileSerializer, UserRegistrationSerializer)                   
from .models import User, EmailVerification
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.shortcuts import redirect


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class EmailVerificationViewSet(viewsets.ModelViewSet):
    queryset = EmailVerification.objects.all()
    serializer_class = EmailVerificationSerializer
    
@method_decorator(csrf_exempt, name='dispatch')
class UserLoginAPIView(APIView):
    permission_classes = []  

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
            return Response({'success': True, 'username': user.username, 'token': token.key,})
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

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                'success': True,
                'message': 'User registered successfully. Please check your email to verify your account.',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'details': serializer.errors if hasattr(serializer, 'errors') else {}
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationConfirmView(APIView):
    """Handles the email verification link clicked by the user."""
    permission_classes = [AllowAny]

    def get(self, request, email, code):
        try:
            user = User.objects.get(email=email)
            verification = EmailVerification.objects.filter(user=user, code=code).first()
            
            if not verification:
                return HttpResponse(
                    '<h1>Verification Failed</h1><p>Invalid verification link.</p>',
                    content_type='text/html', status=400
                )
            
            if verification.is_expired():
                return HttpResponse(
                    '<h1>Link Expired</h1><p>This verification link has expired. Please request a new one.</p>',
                    content_type='text/html', status=400
                )
            
            user.is_verified_email = True
            user.save()
            
            return HttpResponse(
                '''<!DOCTYPE html>
                <html>
                <head><title>Email Verified</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                    <h1 style="color: #28a745;">&#10004; Email Verified Successfully!</h1>
                    <p>Your account has been verified. You can now log in.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; 
                       background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                       Go to Login
                    </a>
                </body>
                </html>''',
                content_type='text/html'
            )
        except User.DoesNotExist:
            return HttpResponse(
                '<h1>Verification Failed</h1><p>User not found.</p>',
                content_type='text/html', status=404
            )


class ResendVerificationEmailView(APIView):
    """Resend verification email to the user."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'success': False, 'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'success': False, 'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_verified_email:
            return Response({'success': False, 'error': 'Email is already verified.'}, status=status.HTTP_400_BAD_REQUEST)
        
        from datetime import timedelta
        from django.utils.timezone import now
        import uuid
        
        # Delete old verifications for this user
        EmailVerification.objects.filter(user=user).delete()
        
        # Create new verification
        expiration = now() + timedelta(hours=48)
        record = EmailVerification.objects.create(
            code=uuid.uuid4(),
            user=user,
            expiration=expiration,
        )
        record.send_verification_email()
        
        return Response({'success': True, 'message': 'Verification email sent successfully.'}, status=status.HTTP_200_OK)
