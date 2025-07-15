from rest_framework.permissions import BasePermission
from .models import Temp, UserData

class BaseStaffAccessPermission(BasePermission):
    access_field = ''
    message = 'You do not have required access permissions'

    def has_permission(self, request, view):
        user = request.user
        try:
            temp = Temp.objects.get(user=user)
            if temp.role.lower() == "staff":
                user_data = UserData.objects.get(user=user, is_deleted=False)
                return getattr(user_data, self.access_field, False)
            return True  # Allow non-staff roles
        except (Temp.DoesNotExist, UserData.DoesNotExist):
            return False

class StaffAttendanceAccessPermission(BaseStaffAccessPermission):
    access_field = 'is_attendance_access'

class StaffUserDataAccessPermission(BaseStaffAccessPermission):
    access_field = 'is_internmanagement_access'

class StaffAssertAccessPermission(BaseStaffAccessPermission):
    access_field = 'is_assert_access'


class StaffPayRollPermission(BaseStaffAccessPermission):
    access_field='is_payroll_access'
