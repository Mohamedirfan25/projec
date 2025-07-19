from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        try:
            temp = getattr(user, 'profile', None)
            if temp:
                return temp.is_admin
            # Fallback: check Temp model directly
            from .models import Temp
            temp_obj = Temp.objects.get(user=user)
            return temp_obj.role.lower() == 'admin'
        except Exception:
            return False
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

class IsStaff(BasePermission):
    """
    Allows access only to users with role 'admin' or 'staff'.
    Use this for endpoints that both admin and staff should access (e.g., /intern, /attendance, /asset, /payroll for staff).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            temp = Temp.objects.get(user=request.user)
            return temp.role.lower() in ['staff', 'admin']
        except Temp.DoesNotExist:
            return False
