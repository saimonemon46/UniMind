from .models import Department, Program, Semester


class DepartmentService:
    @staticmethod
    def queryset():
        return Department.objects.all()


class ProgramService:
    @staticmethod
    def queryset():
        return Program.objects.select_related("department")


class SemesterService:
    @staticmethod
    def queryset():
        return Semester.objects.all()
