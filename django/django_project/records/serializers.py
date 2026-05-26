from rest_framework import serializers
from .models import Record
from django.contrib.auth import authenticate
from django.contrib.auth.models import AnonymousUser
from .models import User
from .login_lockout import (
    LOGIN_FAILED_MESSAGE,
    LOGIN_LOCKED_MESSAGE,
    clear_login_lockout,
    is_login_locked,
    record_failed_login,
)


class RecordSerializer(serializers.ModelSerializer):
    technician_name = serializers.CharField(max_length=240, read_only=True)

    class Meta:
        model = Record
        fields = ('pk', 'technician_name', 'work_order_finished', 'description', 'work_started_at', 'work_finished_at')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and not isinstance(request.user, AnonymousUser):
            validated_data['owner'] = request.user
            validated_data['technician_name'] = request.user.username
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.user and not isinstance(request.user, AnonymousUser):
            instance.technician_name = request.user.username
        return super().update(instance, validated_data)


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializes user registration and creates a new user."""

    # Ensure the password is at least 8 characters, at most 128,
    # and cannot be read by the client.
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True
    )

    # The client should not be able to send a token with the registration
    # request. Make it read-only.
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        # List all fields that may be included in the request or response,
        # including the fields explicitly defined above.
        fields = ['email', 'username', 'password', 'token']

    def create(self, validated_data):
        # Use the create_user method we defined earlier to create a new user.
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=255)
    username = serializers.CharField(max_length=255, read_only=True)
    password = serializers.CharField(max_length=128, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        # In validate, we ensure the current LoginSerializer instance is valid.
        # For login, this means confirming that an email address is present and
        # that the email/password combination matches one of our users.
        email = data.get('email', None)
        password = data.get('password', None)

        # Raise an exception if no email was provided.
        if email is None:
            raise serializers.ValidationError(
                'An email address is required to log in.'
            )

        # Raise an exception if no password was provided.
        if password is None:
            raise serializers.ValidationError(
                'A password is required to log in.'
            )

        try:
            account = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            account = None

        if account is not None and is_login_locked(account):
            raise serializers.ValidationError(LOGIN_LOCKED_MESSAGE)

        # Django's authenticate method checks that the provided email and
        # password match a user in our database. We pass email as username
        # because USERNAME_FIELD = email on the User model.
        auth_username = account.email if account is not None else email
        user = authenticate(username=auth_username, password=password)

        if user is not None and user.is_active:
            clear_login_lockout(user)
            return {
                'email': user.email,
                'username': user.username,
                'token': user.token
            }

        if account is not None and account.is_active:
            record_failed_login(account)
            account.refresh_from_db()
            if is_login_locked(account):
                raise serializers.ValidationError(LOGIN_LOCKED_MESSAGE)

        raise serializers.ValidationError(LOGIN_FAILED_MESSAGE)

class UserSerializer(serializers.ModelSerializer):
    """Serializes and deserializes User objects."""

    # Password must be between 8 and 128 characters. This is the default rule.
    # We could override it, but that would add work without real benefit, so
    # we leave it as is.
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True
    )

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'token',)

        # read_only_fields is an alternative to setting read_only=True on a
        # field, as we did for password above. We use read_only_fields here
        # because the token field does not need min_length or max_length like
        # the password field does.
        read_only_fields = ('token',)

    def update(self, instance, validated_data):
        """Updates a User instance."""

        # Unlike other fields, passwords should not be handled with setattr.
        # Django provides set_password, which hashes and salts the password.
        # Remove the password from validated_data before using the rest.
        password = validated_data.pop('password', None)

        for key, value in validated_data.items():
            # For remaining keys in validated_data, set each value on the
            # current User instance.
            setattr(instance, key, value)

        if password is not None:
            # set_password handles password security on update, so we do not
            # need to worry about hashing ourselves.
            instance.set_password(password)

        # After everything is updated, save the User instance. Note that
        # set_password does not save the model.
        instance.save()

        return instance
