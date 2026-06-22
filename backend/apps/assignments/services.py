from django.utils import timezone

from .models import Assignment, Submission


class AssignmentService:
    @staticmethod
    def queryset_for(user):
        qs = Assignment.objects.select_related("course", "course__faculty", "created_by").prefetch_related("submissions")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(course__faculty=user)
        if user.role == "student":
            return qs.filter(course__enrollments__student=user, course__enrollments__status="active").distinct()
        return qs.none()

    @staticmethod
    def create(serializer, user):
        return serializer.save(created_by=user)


class SubmissionService:
    @staticmethod
    def queryset_for(user):
        qs = Submission.objects.select_related("assignment", "assignment__course", "assignment__course__faculty", "student", "graded_by")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(assignment__course__faculty=user)
        if user.role == "student":
            return qs.filter(student=user)
        return qs.none()

    @staticmethod
    def submit(assignment, user, data):
        return Submission.objects.update_or_create(
            assignment=assignment,
            student=user,
            defaults={"content": data.get("content", ""), "file_url": data.get("file_url", ""), "status": Submission.Status.SUBMITTED},
        )[0]

    @staticmethod
    def grade(submission, user, score, feedback=""):
        submission.score = score
        submission.feedback = feedback
        submission.status = Submission.Status.GRADED
        submission.graded_by = user
        submission.graded_at = timezone.now()
        submission.save(update_fields=["score", "feedback", "status", "graded_by", "graded_at", "updated_at"])
        return submission
