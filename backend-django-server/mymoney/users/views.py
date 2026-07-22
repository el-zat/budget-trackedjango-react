from rest_framework import viewsets, status, generics, permissions
from rest_framework.permissions import AllowAny
from .serializers import (UserSerializer, EmailVerificationSerializer, UserLoginSerializer, 
                          UserProfileSerializer, UserRegistrationSerializer)                   
from .models import User, EmailVerification, PasswordResetToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.shortcuts import redirect
from datetime import timedelta
from django.utils.timezone import now
import uuid


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
            # Block login if email is not verified
            if not user.is_verified_email:
                return Response({
                    'success': False, 
                    'error': 'Please verify your email before logging in. Check your inbox or request a new verification link.',
                    'email_not_verified': True,
                    'email': user.email,
                }, status=status.HTTP_403_FORBIDDEN)
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
        except Exception:
            # Format validation errors into user-friendly messages
            errors = serializer.errors
            messages = []
            for field, field_errors in errors.items():
                for err in field_errors:
                    if isinstance(err, str):
                        messages.append(err)
                    elif isinstance(err, dict):
                        messages.extend(err.values())
            return Response({
                'success': False,
                'error': ' '.join(messages) if messages else 'Validation error.',
                'details': errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                'success': True,
                'message': 'User registered successfully. Please check your email to verify your account.',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Registration error: {e}')
            return Response({
                'success': False,
                'error': 'Registration failed. Please try again later.',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

        try:
            EmailVerification.objects.filter(user=user).delete()
            record = EmailVerification.objects.create(
                code=uuid.uuid4(),
                user=user,
                expiration=now() + timedelta(hours=48),
            )
            record.send_verification_email()
            return Response({'success': True, 'message': 'Verification email sent successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetRequestView(APIView):
    """Request a password reset email."""
    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        if not email:
            return Response({'success': False, 'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether email exists — always return success
            return Response({'success': True, 'message': 'If an account with this email exists, a reset link has been sent.'}, status=status.HTTP_200_OK)
        
        # Delete old tokens for this user
        PasswordResetToken.objects.filter(user=user).delete()
        
        # Create new token (expires in 1 hour)
        token = PasswordResetToken.objects.create(
            code=uuid.uuid4(),
            user=user,
            expiration=now() + timedelta(hours=1),
        )

        token.send_reset_email()
        
        return Response({'success': True, 'message': 'If an account with this email exists, a reset link has been sent.'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and set new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([email, code, new_password, confirm_password]):
            return Response({'success': False, 'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({'success': False, 'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = PasswordResetToken.objects.filter(user=user, code=code, used=False).first()
        if not token:
            return Response({'success': False, 'error': 'Invalid or already used reset link.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if token.is_expired():
            return Response({'success': False, 'error': 'Reset link has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        token.used = True
        token.save()
        
        return Response({'success': True, 'message': 'Password has been reset successfully. You can now log in.'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetValidateTokenView(APIView):
    """Validate that a reset token is still valid (for frontend to check before showing form)."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({'valid': False, 'error': 'Missing parameters.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid link.'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = PasswordResetToken.objects.filter(user=user, code=code, used=False).first()
        if not token or token.is_expired():
            return Response({'valid': False, 'error': 'Link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'valid': True, 'username': user.username}, status=status.HTTP_200_OK)
