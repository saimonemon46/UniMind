from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import CustomUser
from .permissions import IsAdmin
from .serializers import AlmaTokenObtainPairSerializer, UserSerializer


class AlmaTokenObtainPairView(TokenObtainPairView):
    serializer_class = AlmaTokenObtainPairSerializer


class AlmaTokenRefreshView(TokenRefreshView):
    pass


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return CustomUser.objects.select_related("department").order_by("username")

    def get_permissions(self):
        if self.action in ["me"]:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response({"data": serializer.data, "message": "Current user loaded.", "success": True})
