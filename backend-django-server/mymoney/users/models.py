from unittest import result

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.db import models
from django.urls import reverse
from django.utils.timezone import now
import os

class User(AbstractUser):
    image = models.ImageField(upload_to='users_images', null=True, blank=True)
    is_verified_email = models.BooleanField(default=False)


class EmailVerification(models.Model):
    code = models.UUIDField(unique=True)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    expiration = models.DateTimeField()

    def __str__(self):
        return f'EmailVerification object for {self.user.email}'

    def send_verification_email(self):
        link = reverse('email-verification', kwargs={'email': self.user.email, 'code': self.code})
        verification_link = f'{settings.DOMAIN_NAME}{link}'
        print("EMAIL =", self.user.email)
        print("VERIFICATION LINK =", verification_link)

        subject = f'Account confirmation for {self.user.username}'
        message = 'To confirm the account for {} click on the link: {}'.format(
            self.user.email,
            verification_link
        )
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[self.user.email],
            fail_silently=False,
        )

    def is_expired(self):
        return True if now() >= self.expiration else False

    class Meta:
        verbose_name = 'Email verification'
        verbose_name_plural = 'Email verifications'


class PasswordResetToken(models.Model):
    """Token for password reset requests."""
    code = models.UUIDField(unique=True)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    expiration = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        return f'PasswordReset for {self.user.email}'

    def send_reset_email(self):
        # reset_link = f'{settings.DOMAIN_NAME}/reset-password/{self.user.email}/{self.code}/'
        reset_link = f'http://localhost:3000/reset-password/{self.user.email}/{self.code}/'

        FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        reset_link = f'{FRONTEND_URL}/reset-password/{self.user.email}/{self.code}/'

        subject = f'Password reset for {self.user.username}'

        message = (
            f'Hello {self.user.username},\n\n'
            f'You requested a password reset. Click the link below to set a new password:\n\n'
            f'{reset_link}\n\n'
            f'This link will expire in 1 hour.\n\n'
            f'If you did not request this, please ignore this email.'
        )

        html_message = f"""
            <p>Hello {self.user.username},</p>
            <p>You requested a password reset.</p>
            <p>
                <a href="{reset_link}" target="_blank" rel="noopener noreferrer">
                    Reset password
                </a>
            </p>
            <p>This link will expire in 1 hour.</p>
        """
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[self.user.email],
            fail_silently=False,
            html_message=html_message,
        )

    def is_expired(self):
        return now() >= self.expiration

    class Meta:
        verbose_name = 'Password reset token'
        verbose_name_plural = 'Password reset tokens'
