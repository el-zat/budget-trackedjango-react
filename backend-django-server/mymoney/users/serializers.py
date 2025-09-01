from rest_framework import serializers
from .models import User, EmailVerification
from django.contrib.auth import get_user_model, authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'image', 'is_verified_email']


class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = ['code', 'user', 'created', 'expiration']


User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password1', 'password2']

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("A user with this e-mail already exists.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password1'],
        )
        return user
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'image', 'is_verified_email']


class UserLoginSerializer(serializers.Serializer):
    login = serializers.CharField(required=True)  # universal field for username or email
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, data):
        login = data.get('login')
        password = data.get('password')

        if login and password:
            # Authentication attempt first as username
            user = authenticate(username=login, password=password)

            # If unsuccessful, we will try to find the user by email and authenticate by username.
            if user is None:
                try:
                    user_obj = User.objects.get(email=login)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass

            if user is None:
                raise serializers.ValidationError("Incorrect credentials")

            data['user'] = user
            return data
        else:
            raise serializers.ValidationError("Both fields are required: login and password")
