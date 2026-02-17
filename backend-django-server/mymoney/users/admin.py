from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from users.models import User, EmailVerification


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_verified_email', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_verified_email')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('image', 'is_verified_email')}),
    )


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created', 'expiration')
    list_filter = ('created', 'expiration')
    search_fields = ('user__email', 'user__username', 'code')
    readonly_fields = ('created',)
