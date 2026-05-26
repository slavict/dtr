from django.contrib import admin
from django.urls import path, re_path
from records import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,  # Optional: For verifying token validity
)

urlpatterns = [
                  path('admin/', admin.site.urls),
                  re_path(r'^api/records/$', views.RecordListAPIView.as_view()),
                  re_path(r'^api/records/(\d+)$', views.records_detail),
                  path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
                  path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
                  path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
                  path('user', views.UserRetrieveUpdateAPIView.as_view()),
                  path('users/', views.RegistrationAPIView.as_view()),
                  path('users/login/', views.LoginAPIView.as_view()),

              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
