from datetime import timedelta

from django.utils import timezone

LOGIN_FAILED_MESSAGE = (
    'Login failed. Please check your email and password.'
)
LOGIN_LOCKED_MESSAGE = (
    'Too many failed login attempts. Your account is temporarily '
    'locked for 3 minutes. Please try again later.'
)
LOCKOUT_MAX_ATTEMPTS = 3
LOCKOUT_DURATION = timedelta(minutes=3)


def is_login_locked(user):
    if not user.locked_until:
        return False

    if user.locked_until > timezone.now():
        return True

    user.failed_login_attempts = 0
    user.locked_until = None
    user.save(update_fields=['failed_login_attempts', 'locked_until'])
    return False


def clear_login_lockout(user):
    if user.failed_login_attempts == 0 and user.locked_until is None:
        return

    user.failed_login_attempts = 0
    user.locked_until = None
    user.save(update_fields=['failed_login_attempts', 'locked_until'])


def record_failed_login(user):
    user.failed_login_attempts += 1
    update_fields = ['failed_login_attempts']

    if user.failed_login_attempts >= LOCKOUT_MAX_ATTEMPTS:
        user.failed_login_attempts = 0
        user.locked_until = timezone.now() + LOCKOUT_DURATION
        update_fields.append('locked_until')

    user.save(update_fields=update_fields)
