"""
Unit tests for records app. Run in Docker:
  docker-compose run --rm django python manage.py test records
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from records.models import Record

User = get_user_model()


class RecordModelTests(TestCase):
    """Test Record model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="tech1", email="tech1@test.com", password="testpass123"
        )

    def test_record_str(self):
        r = Record(owner=self.user, technician_name="tech1", description="Work")
        self.assertEqual(str(r), "tech1")

    def test_record_owner_null_allowed(self):
        r = Record(technician_name="orphan", description="No owner")
        r.save()
        self.assertIsNone(r.owner_id)


class RecordSerializerTests(TestCase):
    """Test RecordSerializer sets owner and technician_name from request.user."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="serializer_user", email="su@test.com", password="testpass123"
        )

    def test_create_sets_owner_and_technician_name(self):
        from records.serializers import RecordSerializer
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory, force_authenticate

        factory = APIRequestFactory()
        request = factory.post("/api/records/", {})
        force_authenticate(request, user=self.user)
        req = Request(request)

        serializer = RecordSerializer(
            data={
                "description": "Test work",
                "work_order_finished": False,
            },
            context={"request": req},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        record = serializer.save()
        self.assertEqual(record.owner, self.user)
        self.assertEqual(record.technician_name, self.user.username)

    def test_technician_name_is_read_only(self):
        from records.serializers import RecordSerializer

        serializer = RecordSerializer(
            data={
                "technician_name": "hacker",
                "description": "Test",
            },
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertNotIn("technician_name", serializer.validated_data)


class RecordListAPIViewTests(APITestCase):
    """Test record list and create API (scoped by owner)."""

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )
        self.record1 = Record.objects.create(
            owner=self.user1,
            technician_name="user1",
            description="User1 record",
        )
        self.record2 = Record.objects.create(
            owner=self.user2,
            technician_name="user2",
            description="User2 record",
        )

    def test_list_returns_only_own_records(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/records/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["description"], "User1 record")

    def test_list_unauthenticated_returns_403(self):
        response = self.client.get("/api/records/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_sets_owner_and_technician_name(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            "/api/records/",
            {
                "description": "New record",
                "work_order_finished": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        r = Record.objects.get(description="New record")
        self.assertEqual(r.owner, self.user1)
        self.assertEqual(r.technician_name, self.user1.username)


class RecordsDetailAPITests(APITestCase):
    """Test record update and delete (owner-only, no edit when finished)."""

    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner", email="owner@test.com", password="testpass123"
        )
        self.other = User.objects.create_user(
            username="other", email="other@test.com", password="testpass123"
        )
        self.record = Record.objects.create(
            owner=self.owner,
            technician_name="owner",
            description="Original",
            work_order_finished=False,
        )

    def test_put_own_record_succeeds(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.put(
            f"/api/records/{self.record.pk}",
            {"description": "Updated", "work_order_finished": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.record.refresh_from_db()
        self.assertEqual(self.record.description, "Updated")
        self.assertEqual(self.record.technician_name, self.owner.username)

    def test_put_other_user_record_returns_404(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.put(
            f"/api/records/{self.record.pk}",
            {"description": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_put_finished_record_returns_403(self):
        self.record.work_order_finished = True
        self.record.save()
        self.client.force_authenticate(user=self.owner)
        response = self.client.put(
            f"/api/records/{self.record.pk}",
            {"description": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)

    def test_delete_own_record_succeeds(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(f"/api/records/{self.record.pk}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Record.objects.filter(pk=self.record.pk).exists())

    def test_delete_other_user_record_returns_404(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.delete(f"/api/records/{self.record.pk}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Record.objects.filter(pk=self.record.pk).exists())

    def test_put_unauthenticated_returns_403(self):
        response = self.client.put(
            f"/api/records/{self.record.pk}",
            {"description": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RegistrationAPITests(APITestCase):
    """Test registration endpoint."""

    def test_register_creates_user_and_returns_user_with_token(self):
        response = self.client.post(
            "/users/",
            {
                "user": {
                    "email": "new@test.com",
                    "username": "newuser",
                    "password": "securepass123",
                }
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "new@test.com")
        self.assertEqual(response.data["user"]["username"], "newuser")
        self.assertIn("token", response.data["user"])
        self.assertTrue(User.objects.filter(email="new@test.com").exists())

    def test_register_accepts_flat_payload(self):
        response = self.client.post(
            "/users/",
            {
                "email": "flat@test.com",
                "username": "flatuser",
                "password": "securepass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="flat@test.com").exists())
