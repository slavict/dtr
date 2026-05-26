from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from records.login_lockout import LOGIN_LOCKED_MESSAGE, LOCKOUT_DURATION

User = get_user_model()


class LoginLockoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='lockout_user',
            email='lockout@test.com',
            password='correctpass123',
        )
        self.login_url = '/users/login/'
        self.payload = {
            'user': {
                'email': 'lockout@test.com',
                'password': 'wrongpass123',
            }
        }

    def _login(self, email=None, password=None):
        data = {
            'user': {
                'email': email or self.user.email,
                'password': password or 'wrongpass123',
            }
        }
        return self.client.post(self.login_url, data, format='json')

    def test_three_wrong_passwords_lock_account(self):
        for attempt in range(3):
            response = self._login()
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            if attempt == 2:
                self.assertIn(LOGIN_LOCKED_MESSAGE, str(response.data))

        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.locked_until)
        self.assertGreater(self.user.locked_until, timezone.now())

    def test_locked_account_rejects_login_even_with_correct_password(self):
        self.user.failed_login_attempts = 0
        self.user.locked_until = timezone.now() + LOCKOUT_DURATION
        self.user.save(update_fields=['failed_login_attempts', 'locked_until'])

        response = self._login(password='correctpass123')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(LOGIN_LOCKED_MESSAGE, str(response.data))

    def test_successful_login_clears_failed_attempts(self):
        self.user.failed_login_attempts = 2
        self.user.save(update_fields=['failed_login_attempts'])

        response = self._login(password='correctpass123')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 0)
        self.assertIsNone(self.user.locked_until)

    def test_lock_expires_and_allows_login(self):
        self.user.locked_until = timezone.now() - timedelta(seconds=1)
        self.user.save(update_fields=['locked_until'])

        response = self._login(password='correctpass123')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unknown_email_does_not_increment_lockout(self):
        response = self.client.post(
            self.login_url,
            {
                'user': {
                    'email': 'nobody@test.com',
                    'password': 'wrongpass123',
                }
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.filter(email='nobody@test.com').count(), 0)
