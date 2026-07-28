from __future__ import annotations

from collections import Counter
import os
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path
from random import Random
from time import perf_counter

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from apps.accounts.models import CustomUser
from apps.assignments.models import Assignment, Submission
from apps.attendance.models import AttendanceRecord
from apps.courses.models import Course, Enrollment
from apps.departments.models import Department, Program, Semester
from apps.grades.models import Grade
from apps.messaging.models import Announcement, Notification
from apps.scheduling.models import ClassSchedule, ExamSchedule, Room
from apps.students.models import StudentProfile
from apps.advisors.models import InterventionPlan, CounselingLog


PASSWORD = "Password123"
RNG = Random(20260729)
FAKER = Faker("en_US")
Faker.seed(20260729)

DEPARTMENTS = [
    ("Computer Science", "CSE"), ("Software Engineering", "SWE"),
    ("Electrical and Electronic Engineering", "EEE"), ("Civil Engineering", "CE"),
    ("Mechanical Engineering", "ME"), ("Business Administration", "BBA"),
    ("Economics", "ECO"), ("English", "ENG"), ("Mathematics", "MAT"),
    ("Physics", "PHY"), ("Chemistry", "CHE"),
]
PROGRAMS = [
    ("CSE", "BSc in Computer Science and Engineering", "BSC-CSE", "Undergraduate"),
    ("CSE", "MSc in Computer Science", "MSC-CSE", "Postgraduate"),
    ("SWE", "BSc in Software Engineering", "BSC-SWE", "Undergraduate"),
    ("SWE", "MSc in Software Engineering", "MSC-SWE", "Postgraduate"),
    ("EEE", "BSc in Electrical and Electronic Engineering", "BSC-EEE", "Undergraduate"),
    ("CE", "BSc in Civil Engineering", "BSC-CE", "Undergraduate"),
    ("ME", "BSc in Mechanical Engineering", "BSC-ME", "Undergraduate"),
    ("BBA", "Bachelor of Business Administration", "BBA", "Undergraduate"),
    ("BBA", "Master of Business Administration", "MBA", "Postgraduate"),
    ("ECO", "BA in Economics", "BA-ECO", "Undergraduate"),
    ("ENG", "BA in English", "BA-ENG", "Undergraduate"),
    ("MAT", "BSc in Mathematics", "BSC-MAT", "Undergraduate"),
    ("PHY", "BSc in Physics", "BSC-PHY", "Undergraduate"),
    ("CHE", "BSc in Chemistry", "BSC-CHE", "Undergraduate"),
    ("CSE", "Diploma in Data Science", "DIP-DS", "Diploma"),
    ("BBA", "Executive MBA", "EMBA", "Postgraduate"),
]
COURSE_TITLES = [
    "Programming Fundamentals", "Data Structures and Algorithms", "Database Systems",
    "Operating Systems", "Computer Networks", "Software Engineering", "Web Engineering",
    "Artificial Intelligence", "Machine Learning", "Cloud Computing", "Cyber Security",
    "Digital Logic Design", "Signals and Systems", "Electronic Devices", "Structural Analysis",
    "Engineering Mechanics", "Thermodynamics", "Manufacturing Processes", "Financial Accounting",
    "Principles of Marketing", "Microeconomics", "Macroeconomics", "Academic Writing",
    "British Literature", "Calculus I", "Linear Algebra", "Classical Mechanics",
    "Electromagnetism", "Organic Chemistry", "Analytical Chemistry",
]


def grade_for(percentage: Decimal) -> tuple[str, Decimal]:
    value = float(percentage)
    scale = [(80, "A+", Decimal("4.00")), (75, "A", Decimal("3.75")), (70, "A-", Decimal("3.50")), (65, "B+", Decimal("3.25")), (60, "B", Decimal("3.00")), (55, "B-", Decimal("2.75")), (50, "C+", Decimal("2.50")), (45, "C", Decimal("2.25")), (40, "D", Decimal("2.00"))]
    return next((letter, points) for cutoff, letter, points in scale if value >= cutoff) if value >= 40 else ("F", Decimal("0.00"))


class Command(BaseCommand):
    help = "Create a realistic, idempotent UniMind demo dataset."

    def handle(self, *args, **options):
        started = perf_counter()
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding UniMind demo dataset..."))
        with transaction.atomic():
            departments = self.seed_departments()
            programs = self.seed_programs(departments)
            semesters = self.seed_semesters()
            admin = self.seed_admin()
            faculty = self.seed_users("faculty", 10, departments)
            advisors = self.seed_users("advisor", 5, departments)
            students = self.seed_users("student", 100, departments)
            self.seed_student_profiles(students, programs, advisors)
            courses = self.seed_courses(departments, programs, semesters["SPR-2026"], faculty)
            enrollments = self.seed_enrollments(students, courses)
            self.seed_assignments(courses)
            self.seed_submissions(enrollments)
            self.seed_attendance(enrollments)
            self.seed_grades(enrollments)
            self.seed_messaging(admin, students, faculty, advisors)
            self.seed_schedules(courses, faculty, admin)
            self.write_docs(admin, faculty, advisors, students, programs, semesters, started)
        self.stdout.write(self.style.SUCCESS(f"Done. {self.total_records():,} records are available in {perf_counter() - started:.1f}s."))

    def progress(self, message: str) -> None:
        self.stdout.write(self.style.NOTICE(message))

    def seed_departments(self):
        self.progress("Creating departments...")
        return {code: Department.objects.update_or_create(code=code, defaults={"name": name, "description": f"Department of {name} at UniMind University."})[0] for name, code in DEPARTMENTS}

    def seed_programs(self, departments):
        self.progress("Creating programs...")
        results = {}
        for department_code, name, code, degree_level in PROGRAMS:
            results[code] = Program.objects.update_or_create(code=code, defaults={"department": departments[department_code], "name": name, "degree_level": degree_level})[0]
        return results

    def seed_semesters(self):
        self.progress("Creating semesters...")
        data = [("Spring 2026", "SPR-2026", date(2026, 1, 11), date(2026, 5, 7), "completed"), ("Summer 2026", "SUM-2026", date(2026, 5, 17), date(2026, 8, 13), "active"), ("Fall 2026", "FAL-2026", date(2026, 9, 6), date(2026, 12, 24), "upcoming")]
        return {code: Semester.objects.update_or_create(code=code, defaults={"name": name, "starts_on": starts_on, "ends_on": ends_on, "status": status})[0] for name, code, starts_on, ends_on, status in data}

    def user_defaults(self, role, index, department):
        first, last = FAKER.first_name(), FAKER.last_name()
        return {"email": f"{role}{index:02d}@unimind.demo", "first_name": first, "last_name": last, "role": role, "department": department, "phone": FAKER.numerify("+8801#########"), "avatar_url": f"https://i.pravatar.cc/300?img={(index % 70) + 1}", "is_active": True}

    def make_user(self, username, defaults, staff=False):
        user, created = CustomUser.objects.get_or_create(username=username, defaults=defaults)
        for field, value in defaults.items(): setattr(user, field, value)
        user.is_staff = staff
        user.is_superuser = staff
        user.set_password(PASSWORD)
        user.save()
        return user

    def seed_admin(self):
        self.progress("Creating administrator...")
        return self.make_user("admin", {"email": "admin@unimind.demo", "first_name": "Amina", "last_name": "Rahman", "role": "admin", "phone": "+8801700000000", "avatar_url": "", "is_active": True}, staff=True)

    def seed_users(self, role, count, departments):
        self.progress(f"Creating {count} {role} accounts...")
        records = []
        department_list = list(departments.values())
        for index in range(1, count + 1):
            username = f"{role}{index:02d}" if role != "student" else f"student{index:03d}"
            records.append(self.make_user(username, self.user_defaults(role, index, department_list[(index - 1) % len(department_list)])))
        return records

    def seed_student_profiles(self, students, programs, advisors):
        self.progress("Assigning students to programs and advisors...")
        program_list = list(programs.values())
        for index, student in enumerate(students, start=1):
            program = next((item for item in program_list if item.department_id == student.department_id), program_list[index % len(program_list)])
            advisor = advisors[(index - 1) % len(advisors)]
            StudentProfile.objects.update_or_create(user=student, defaults={"university_id": f"UM-{2026 - (index % 4):04d}-{index:04d}", "program": program, "advisor": advisor, "enrollment_date": date(2024 + (index % 3), 1, 15)})
            if index % 7 == 0:
                InterventionPlan.objects.update_or_create(advisor=advisor, student=student, focus="Attendance and academic progress", defaults={"next_step": "Review attendance, recent grades, and upcoming course work.", "status": "in_progress" if index % 14 else "monitoring"})
            if index % 10 == 0:
                CounselingLog.objects.update_or_create(advisor=advisor, student=student, met_at=timezone.now() - timedelta(days=index % 21), defaults={"notes": "Reviewed current academic progress and agreed on follow-up actions.", "follow_up_at": timezone.now() + timedelta(days=14)})
    def seed_courses(self, departments, programs, semester, faculty):
        self.progress("Creating 55 courses...")
        courses, program_list = [], list(programs.values())
        for department_index, (_, department_code) in enumerate(DEPARTMENTS):
            for number in range(1, 6):
                title = COURSE_TITLES[(department_index * 5 + number - 1) % len(COURSE_TITLES)]
                code = f"{department_code}{100 + number}"
                assigned_faculty = next((member for member in faculty if member.department_id == departments[department_code].id), faculty[department_index % len(faculty)])
                program = next((item for item in program_list if item.department_id == departments[department_code].id), None)
                course, _ = Course.objects.update_or_create(code=code, defaults={"department": departments[department_code], "program": program, "semester": semester, "faculty": assigned_faculty, "title": title, "description": f"A foundational UniMind course in {title.lower()} with applied learning activities.", "credits": Decimal("3.0"), "capacity": 45, "is_active": True})
                courses.append(course)
        return courses

    def seed_enrollments(self, students, courses):
        self.progress("Creating enrollments...")
        by_department = {}
        for course in courses: by_department.setdefault(course.department_id, []).append(course)
        enrollments = []
        for index, student in enumerate(students):
            available = by_department.get(student.department_id, courses)
            chosen = available if len(available) <= 5 else RNG.sample(available, 5)
            for course in chosen:
                enrollment, _ = Enrollment.objects.get_or_create(student=student, course=course, defaults={"status": "active"})
                enrollments.append(enrollment)
        return enrollments

    def seed_assignments(self, courses):
        self.progress("Creating assignments...")
        now = timezone.now()
        templates = [("Problem Set", "Apply the course concepts to the provided problems."), ("Case Study", "Submit a concise analysis using evidence from class."), ("Practical Project", "Build and document a small, well-tested practical solution.")]
        for course in courses:
            for position, (label, description) in enumerate(templates, start=1):
                Assignment.objects.update_or_create(course=course, title=f"{course.code} {label} {position}", defaults={"description": description, "due_at": now + timedelta(days=7 + position * 14), "points": Decimal("100.00"), "created_by": course.faculty})

    def seed_submissions(self, enrollments):
        self.progress("Creating submissions...")
        now = timezone.now()
        for enrollment in enrollments:
            for assignment in enrollment.course.assignments.all():
                if RNG.random() < 0.15: continue
                score = Decimal(str(RNG.randint(55, 98)))
                status = "graded" if RNG.random() < 0.75 else "submitted"
                submission, _ = Submission.objects.update_or_create(assignment=assignment, student=enrollment.student, defaults={"content": "Demo submission: analysis and supporting work completed.", "file_url": "", "status": status, "score": score if status == "graded" else None, "feedback": "Clear work. Review the rubric comments before the next assessment." if status == "graded" else "", "graded_by": enrollment.course.faculty if status == "graded" else None, "graded_at": now - timedelta(days=RNG.randint(0, 10)) if status == "graded" else None})
                Submission.objects.filter(pk=submission.pk).update(submitted_at=assignment.due_at - timedelta(days=RNG.randint(-2, 8)))

    def seed_attendance(self, enrollments):
        self.progress("Generating attendance records...")
        statuses = ["present"] * 15 + ["late"] * 2 + ["absent"] * 2 + ["excused"]
        start = date(2026, 5, 18)
        for enrollment in enrollments:
            for offset in range(20):
                class_date = start + timedelta(days=offset)
                if class_date.weekday() >= 5: class_date += timedelta(days=2)
                AttendanceRecord.objects.update_or_create(course=enrollment.course, student=enrollment.student, class_date=class_date, defaults={"marked_by": enrollment.course.faculty, "status": RNG.choice(statuses), "notes": ""})

    def seed_grades(self, enrollments):
        self.progress("Generating final grades...")
        for enrollment in enrollments:
            percentage = Decimal(str(RNG.randint(52, 96)))
            letter, points = grade_for(percentage)
            Grade.objects.update_or_create(student=enrollment.student, course=enrollment.course, defaults={"graded_by": enrollment.course.faculty, "letter": letter, "points": points, "percentage": percentage, "remarks": "Demo final result generated from course assessment performance."})

    def seed_messaging(self, admin, students, faculty, advisors):
        self.progress("Creating announcements and notifications...")
        announcements = [("Welcome to UniMind", "Welcome to the new academic term. Please review your timetable and course resources.", "all"), ("Midterm examination schedule", "The midterm schedule will be published through the academic calendar.", "student"), ("Faculty development workshop", "Faculty members are invited to the teaching innovation workshop.", "faculty"), ("Academic advising week", "Advisors should complete student check-ins this week.", "advisor"), ("Course registration open", "Registration changes are open through Friday.", "all"), ("Scholarship applications", "Eligible students may submit scholarship applications this month.", "student"), ("AI seminar", "Join the university seminar on responsible AI in education.", "all"), ("Hackathon 2026", "Registration is now open for the UniMind Innovation Hackathon.", "student"), ("Public holiday notice", "University offices will remain closed on the listed public holiday.", "all"), ("Graduation clearance", "Final-year students should review graduation clearance requirements.", "student")]
        for title, body, audience in announcements: Announcement.objects.update_or_create(title=title, defaults={"body": body, "audience": audience, "created_by": admin})
        recipients = students + faculty + advisors
        for user in recipients:
            Notification.objects.update_or_create(recipient=user, title="Semester update", defaults={"message": "Your UniMind academic workspace has been updated for the active semester.", "kind": "info", "is_read": False, "read_at": None})
            if user.role == "student": Notification.objects.update_or_create(recipient=user, title="Assignment reminder", defaults={"message": "Review course assignments and submit work before its deadline.", "kind": "warning", "is_read": False, "read_at": None})

    def seed_schedules(self, courses, faculty, admin):
        self.progress("Creating rooms, class routines, and exam schedules...")
        rooms = []
        for index in range(1, 11): rooms.append(Room.objects.update_or_create(code=f"RM-{100 + index}", defaults={"name": f"Teaching Room {index}", "building": "Academic Building", "capacity": 50, "is_active": True})[0])
        days, slots = ["monday", "tuesday", "wednesday", "thursday", "friday"], [(time(9), time(10, 30)), (time(11), time(12, 30)), (time(14), time(15, 30))]
        for index, course in enumerate(courses):
            room = rooms[index % len(rooms)]
            for meeting in range(2):
                start, end = slots[(index + meeting) % len(slots)]
                ClassSchedule.objects.update_or_create(course=course, day_of_week=days[(index + meeting * 2) % len(days)], start_time=start, defaults={"room": room, "end_time": end, "created_by": admin})
            starts_at = timezone.make_aware(datetime(2026, 8, 16, 9, 0)) + timedelta(days=index)
            exam, _ = ExamSchedule.objects.update_or_create(course=course, title="Summer 2026 Final Examination", defaults={"room": room, "starts_at": starts_at, "ends_at": starts_at + timedelta(hours=2), "status": "published", "created_by": admin})
            exam.invigilators.set([course.faculty, faculty[(index + 1) % len(faculty)]])

    def total_records(self):
        models = [CustomUser, Department, Program, Semester, Course, Enrollment, AttendanceRecord, Assignment, Submission, Grade, Notification, Announcement, Room, ClassSchedule, ExamSchedule]
        return sum(model.objects.count() for model in models)

    def write_docs(self, admin, faculty, advisors, students, programs, semesters, started):
        self.progress("Writing demo account and summary documentation...")
        docs = Path(os.environ.get("DEMO_DOCS_DIR", Path(__file__).resolve().parents[5] / "docs"))
        docs.mkdir(exist_ok=True)
        groups = [("Administrator", [admin]), ("Faculty", faculty), ("Advisor", advisors), ("Student", students)]
        lines = ["# Demo Accounts", "", "All demo accounts use the development-only password: `Password123`.", ""]
        for label, users in groups:
            lines.extend([f"## {label}", ""])
            for user in users:
                lines.extend([f"### {user.get_full_name() or user.username}", f"- Username: `{user.username}`", f"- Email: `{user.email}`", f"- Role: `{user.role.upper()}`", f"- Department: {user.department.name if user.department else '—'}", ""])
        (docs / "demo_accounts.md").write_text("\n".join(lines), encoding="utf-8")
        counts = [("Departments", Department.objects.count()), ("Programs", Program.objects.count()), ("Semesters", Semester.objects.count()), ("Courses", Course.objects.count()), ("Faculty", CustomUser.objects.filter(role="faculty").count()), ("Students", CustomUser.objects.filter(role="student").count()), ("Advisors", CustomUser.objects.filter(role="advisor").count()), ("Enrollments", Enrollment.objects.count()), ("Attendance records", AttendanceRecord.objects.count()), ("Assignments", Assignment.objects.count()), ("Submissions", Submission.objects.count()), ("Grades", Grade.objects.count()), ("Notifications", Notification.objects.count()), ("Announcements", Announcement.objects.count()), ("Rooms", Room.objects.count()), ("Class schedules", ClassSchedule.objects.count()), ("Exam schedules", ExamSchedule.objects.count())]
        summary = ["# UniMind Demo Dataset", "", f"Generated: {timezone.localtime():%Y-%m-%d %H:%M %Z}", f"Generation time: {perf_counter() - started:.1f} seconds", "", "## Statistics", ""] + [f"- {name}: {count}" for name, count in counts] + ["", "## Notes", "", "- The existing models do not include student profile fields (such as university ID, gender, address, date of birth, program, or advisor), messaging conversations, or periodic-task models; these were intentionally not fabricated.", "- Students are linked to departments through their user account and to courses through enrollments.", "- Course grades are final course grades because the current Grade model has no assessment-category field."]
        (docs / "demo_summary.md").write_text("\n".join(summary), encoding="utf-8")



