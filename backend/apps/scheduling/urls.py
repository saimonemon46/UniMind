from rest_framework.routers import DefaultRouter

from .views import ClassScheduleViewSet, ExamScheduleViewSet, RoomViewSet

router = DefaultRouter()
router.register("rooms", RoomViewSet, basename="room")
router.register("class-schedules", ClassScheduleViewSet, basename="class-schedule")
router.register("exam-schedules", ExamScheduleViewSet, basename="exam-schedule")

urlpatterns = router.urls
