import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class JWTAuthentication(authentication.BaseAuthentication):
    authentication_header_prefix = 'token'

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()

        if not auth_header:
            return None

        if auth_header[0].decode('utf-8').lower() != self.authentication_header_prefix:
            return None

        if len(auth_header) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')

        if len(auth_header) > 2:
            raise AuthenticationFailed(
                'Invalid token header. Token string should not contain spaces.'
            )

        try:
            token = auth_header[1].decode('utf-8')
        except UnicodeError:
            raise AuthenticationFailed(
                'Invalid token header. Token string should not contain invalid characters.'
            )

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')

        try:
            user = User.objects.get(pk=payload['id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')

        if not user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')

        return (user, token)
