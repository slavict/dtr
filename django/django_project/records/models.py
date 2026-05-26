import jwt
from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if username is None:
            raise TypeError('Users must have a username.')
        if email is None:
            raise TypeError('Users must have an email address.')

        user = self.model(username=username, email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(db_index=True, max_length=255, unique=True)
    email = models.EmailField(db_index=True, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    @property
    def token(self):
        dt = datetime.now() + timedelta(days=1)
        token = jwt.encode(
            {
                'id': self.pk,
                'exp': int(dt.timestamp()),
            },
            settings.SECRET_KEY,
            algorithm='HS256',
        )
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        return token

    def __str__(self):
        return self.email


class Record(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='records',
        null=True,
        blank=True,
    )
    technician_name = models.CharField(max_length=240)
    description = models.TextField(blank=True, default='')
    work_order_finished = models.BooleanField(default=False)
    work_started_at = models.DateField(null=True, blank=True)
    work_finished_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.technician_name
