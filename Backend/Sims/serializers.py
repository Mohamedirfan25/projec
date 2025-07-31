from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

# In serializers.py (at the top of the file)
from decimal import Decimal



class TempSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Temp
        fields = ['emp_id', 'username', 'role', 'created_date', 'updated_date']
        extra_kwargs = {
            'emp_id': {'read_only': True}  # Make emp_id read-only
        }



class UserProfileSerializer(serializers.ModelSerializer):
    #role = serializers.CharField(source='temps.role', read_only=True)  # Access role through Temp model
    class Meta:
        model = UserProfile
        fields = ['user']



class UserSerialize(serializers.ModelSerializer):
    #profile = UserProfileSerializer(read_only=True)
    temp = serializers.SerializerMethodField()
    
    

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',  'temp']

    def get_temp(self, user):
        temp = Temp.objects.filter(user=user).first()
        if temp:
            serializer = TempSerializer(temp)
            return serializer.data
        return None
    
class PersonalDataSerializer(serializers.ModelSerializer):
    emp_id = serializers.PrimaryKeyRelatedField(queryset=Temp.objects.all()) # Un-commented and corrected
    username = serializers.CharField(source='emp_id.user.username', read_only=True) # Added to get username from Temp
    email = serializers.EmailField(source='user.email', read_only=True) 
    class Meta:
        model = PersonalData
        fields = '__all__'
        read_only_fields = ('id','user','emp_id') # Make id read-only

class UserDataSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='emp_id.user.username', read_only=True)
    reporting_manager_username = serializers.CharField(source='reporting_manager.username', read_only=True)
    reporting_supervisor_username = serializers.CharField(source='reporting_supervisor.username', read_only=True)
    domain_name = serializers.CharField(source='domain.domain', read_only=True)
    
    # Add Temp details
    temp_details = TempSerializer(source='emp_id', read_only=True)
    reporting_manager = serializers.CharField(write_only=True, required=False, allow_null=True)
    reporting_supervisor = serializers.CharField(write_only=True, required=False, allow_null=True)
    domain_name = serializers.CharField(source='domain.domain', read_only=True)
    
    class Meta:
        model = UserData
        fields = "__all__"
        read_only_fields = ("id", "username", "emp_id")
    
    def validate_reporting_manager(self, value):
        if not value:
            return None
        try:
            return User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Reporting manager not found")
    
    def validate_reporting_supervisor(self, value):
        if not value:
            return None
        try:
            return User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Reporting supervisor not found")



class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'



class CollegeDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollegeDetails
        fields = '__all__'
        read_only_fields = ('id','emp_id') # Make id read-only


class AssertStockSerializer(serializers.ModelSerializer):
    emp_id = serializers.PrimaryKeyRelatedField(
        queryset=Temp.objects.all(), 
        allow_null=True,  # Allow null assignments
        required=False
    )
    department = serializers.CharField(
        allow_null=True,
        required=False
    )
    allocated_type = serializers.ChoiceField(
        choices=AssertStock._meta.get_field('allocated_type').choices,
        allow_null=True,
        required=False
    )
    
    class Meta:
        model = AssertStock
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate_department(self, value):
        if value:
            # Get or create department
            department, created = Department.objects.get_or_create(
                department=value,
                defaults={'description': f"{value} Department"}
            )
            return department
        return None


class AssertIssueSerializer(serializers.ModelSerializer):
    assert_stock_details = AssertStockSerializer(source='assert_id', read_only=True)
    class Meta:
        model = AssertIssue
        fields = '__all__'
        read_only_fields = ('id',) # Make id read-only

class FeesSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='emp_id.user.username', read_only=True)  # read-only username for display

    class Meta:
        model = Fees
        fields = '__all__'
        read_only_fields = ('id', 'user')  # user is read-only

    def validate(self, data):
        # Automatically set user from emp_id if emp_id is provided
        emp = data.get('emp_id')
        if emp and hasattr(emp, 'user'):
            data['user'] = emp.user
        return data

class FeeStructureSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = FeeStructure
        fields = '__all__'
        read_only_fields = ('id',)


class AttendanceEntriesSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AttendanceEntries
        fields = '__all__'
        read_only_fields = ('id', 'created_date', 'updated_date')


# serializers.py
class AttendanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceLog
        fields = '__all__'
        read_only_fields = ('id', 'created_date', 'updated_date')

class AttendanceSerializer(serializers.ModelSerializer):
    entries = AttendanceEntriesSerializer(many=True, read_only=True)
    logs = AttendanceLogSerializer(many=True, read_only=True)  # Already correct

    class Meta:
        model = Attendance
        fields = ['id', 'name', 'emp_id', 'date', 'check_in', 'check_out', 
                 'total_hours', 'leave_request', 'present_status', 'entries', 'logs']
     

    def validate(self, data):
        """
        Custom validation to ensure:
        - If leave_request is True, check-in and check-out should not be present.
        """
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        leave_request = data.get('leave_request', False)

        if leave_request and (check_in or check_out):
            raise serializers.ValidationError("Leave requests should not have check-in or check-out times.")
        return data



class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'
        read_only_fields = ('id',) # Make id read-only

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.CharField(write_only=True)
    assigned_by = serializers.CharField(write_only=True)
    assigned_to_user = serializers.SerializerMethodField(read_only=True)
    assigned_by_user = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('id',)
    def validate_assigned_to(self, value):
        try:
            user = User.objects.get(username=value)
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("Assigned to user does not exist.")
    def validate_assigned_by(self, value):
        try:
            user = User.objects.get(username=value)
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("Assigned by user does not exist.")
    def create(self, validated_data):
        validated_data["assigned_to"] = validated_data.pop("assigned_to")
        validated_data["assigned_by"] = validated_data.pop("assigned_by")
        return super().create(validated_data)
    def get_assigned_to_user(self, obj):
        return obj.assigned_to.username
    def get_assigned_by_user(self, obj):
        return obj.assigned_by.username
    def update(self, instance, validated_data):
        # Track status changes
        new_status = validated_data.get('status', instance.status)
        old_status = instance.status
        # Automatically set dates based on status transitions
        if new_status == 'In_Progress' and not instance.start_date:
            instance.start_date = timezone.now().date()
            
        if new_status == 'Completed' and not instance.end_date:
            instance.end_date = timezone.now().date()
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance





class ResetPasswordOTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class UpdatePasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        return data
        

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'
    
def update(self, instance, validated_data):
    # Get new domain name if provided
    new_domain = validated_data.get('domain')
    
    # Simply update the instance with all validated data
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    
    instance.save()
    return instance




# Update in serializers.py
# serializers.py (update rating field)
class FeedbackSerializer(serializers.ModelSerializer):
    feedback_by = TempSerializer(read_only=True)
    feedback_to = TempSerializer(read_only=True)
    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=1,
        min_value=Decimal('0.5'),  # Now properly referenced
        max_value=Decimal('5.0')
    )

    class Meta:
        model = Feedback
        fields = [
            'id', 
            'feedback_by', 
            'feedback_to', 
            'comments', 
            'rating',
            'feedback_date',
            'category',
            'is_private',
            'status',
            'created_date',
            'updated_date'
        ]
        read_only_fields = ('id', 'created_date', 'updated_date')

    # For write operations, maintain original behavior
    def to_internal_value(self, data):
        self.fields['feedback_by'] = serializers.PrimaryKeyRelatedField(
            queryset=Temp.objects.all()
        )
        self.fields['feedback_to'] = serializers.PrimaryKeyRelatedField(
            queryset=Temp.objects.all()
        )
        return super().to_internal_value(data)
    


    

class LeaveRequestSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    reporting_manager_username = serializers.CharField(
        source='reporting_manager.username',
        read_only=True
    )
    Total_leave_count = serializers.IntegerField(
        source='remaining_leave_count', # Or source='max_leave_count' if available
        read_only=True
    )
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'user', 'leave_type', 'from_date', 'to_date',
            'half_day_start', 'half_day_end', 'request_reason',
            'status', 'created_at', 'remaining_leave_count',
            'number_of_days', 'reporting_manager_username',
            'Total_leave_count', 'is_deleted'
        ]
        read_only_fields = [
            'user', 'status', 'created_at',
            'remaining_leave_count', 'reporting_manager_username'
        ]
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        validated_data['user'] = user
        # Get reporting manager from UserData (not supervisor)
        user_data = UserData.objects.filter(user=user).first()
        if user_data:
            validated_data['reporting_manager'] = user_data.reporting_manager
        # Calculate leave days
        from_date = validated_data['from_date']
        to_date = validated_data['to_date']
        validated_data['number_of_days'] = (to_date - from_date).days + 1
        # Handle half-day logic
        half_day_start = validated_data.get('half_day_start', False)
        half_day_end = validated_data.get('half_day_end', False)
        if half_day_start and half_day_end and (from_date == to_date):
            validated_data['number_of_days'] = 0.5
        else:
            if half_day_start:
                validated_data['number_of_days'] -= 0.5
            if half_day_end:
                validated_data['number_of_days'] -= 0.5
        return super().create(validated_data)    





    
class LeaveApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['status']
    def update(self, instance, validated_data):
        new_status = validated_data.get('status')
        old_status = instance.status
        if not new_status or new_status == old_status:
            return instance
        instance.status = new_status
        instance.save()
        # Deduct leaves only if newly approved
        if new_status == "APPROVED" and old_status != "APPROVED":
            instance.deduct_leave_count()
        return instance






#-----------------------------------New Changes----------------------------------------------------#
class DocumentSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        file = validated_data.pop('file', None)
        validated_data.pop('declaration_number', None)
        instance = Document(**validated_data)
        instance.save()
        if file:
            instance.file = file
            instance.save()
        return instance

    uploader = serializers.SlugRelatedField(
        slug_field='emp_id',  # Use 'emp_id' to identify the Temp instance
        queryset=Temp.objects.all()
    )

    class Meta:
        model = Document
        fields = '__all__'
        

from django.db.models import Max

class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = '__all__'
        read_only_fields = ('version_number',)

    def create(self, validated_data):
        document = validated_data['document']
        # Get current max version for this document
        max_version = DocumentVersion.objects.filter(
            document=document
        ).aggregate(Max('version_number'))['version_number__max'] or 0
        
        validated_data['version_number'] = max_version + 1
        return super().create(validated_data)




class AssignedTaskHistorySerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    task_description = serializers.CharField(read_only=True)  # Add this line
    class Meta:
        model = Task
        fields = [
            'id', 'task_title', 'task_description', 'committed_date', 'start_date', 'end_date',
            'assigned_to_username', 'assigned_by_username', 'priority', 'status'
        ]










class UserDetailSerializer(serializers.ModelSerializer):
    personal_data = serializers.SerializerMethodField()
    user_data = serializers.SerializerMethodField()
    college_details = serializers.SerializerMethodField()
    fees_details = serializers.SerializerMethodField()
    attendance_details = serializers.SerializerMethodField()
    temp_details = TempSerializer(source='profile.temp', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'temp_details', 'personal_data', 'user_data', 
            'college_details', 'fees_details', 'attendance_details'
        ]

    def get_personal_data(self, obj):
        try:
            # Corrected: Query PersonalData directly using user
            return PersonalDataSerializer(PersonalData.objects.get(user=obj)).data
        except PersonalData.DoesNotExist:
            return None

    def get_user_data(self, obj):
        try:
            # Corrected: Query UserData directly using user
            return UserDataSerializer(UserData.objects.get(user=obj)).data
        except UserData.DoesNotExist:
            return None

    def get_college_details(self, obj):
        try:
            # Corrected: Query CollegeDetails via Temp model
            temp = Temp.objects.get(user=obj)
            return CollegeDetailsSerializer(CollegeDetails.objects.get(emp_id=temp)).data
        except (CollegeDetails.DoesNotExist, Temp.DoesNotExist):
            return None

    def get_fees_details(self, obj):
        try:
            fees = Fees.objects.filter(user=obj)
            return FeesSerializer(fees, many=True).data
        except Fees.DoesNotExist:
            return []

    def get_attendance_details(self, obj):
        try:
            # Corrected: Query Attendance via Temp model
            temp = Temp.objects.get(user=obj)
            attendance = Attendance.objects.filter(emp_id=temp)
            return AttendanceSerializer(attendance, many=True).data
        except (Attendance.DoesNotExist, Temp.DoesNotExist):
            return []




class AssertAssignmentLogSerializer(serializers.ModelSerializer):
    asset_details = AssertStockSerializer(source='asset', read_only=True)
    actor = serializers.CharField(source='user.username', read_only=True)
    emp_id = serializers.CharField(source='emp.emp_id', read_only=True)

    class Meta:
        model = AssertAssignmentLog
        fields = '__all__'
        read_only_fields = ('timestamp',)


class AttendanceClaimSerializer(serializers.ModelSerializer):
    # Add intern display fields
    employee_name = serializers.SerializerMethodField(read_only=True)
    employee_id = serializers.SerializerMethodField(read_only=True)
    user = serializers.CharField(source='user.username', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    def get_employee_name(self, obj):
        """Return intern full name or username"""
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username

    def get_employee_id(self, obj):
        """Return intern ID from related Temp model or UserData"""
        # Try Temp model first
        temp = getattr(obj.user, 'temp', None)
        if temp and hasattr(temp, 'emp_id'):
            return temp.emp_id
        # Fallback to UserData
        try:
            user_data = UserData.objects.get(user=obj.user, is_deleted=False)
            if user_data.emp_id:
                return user_data.emp_id.emp_id if hasattr(user_data.emp_id, 'emp_id') else None
        except UserData.DoesNotExist:
            pass
        return None
    
    class Meta:
        model = AttendanceClaim
        fields = [
            'id', 'user', 'employee_name', 'employee_id', 'for_period', 'from_date', 'to_date', 
            'from_day_type', 'from_half_day_type', 'to_day_type', 'to_half_day_type',
            'comments', 'status', 'reviewed_by_username', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'employee_name', 'employee_id', 'status', 'reviewed_by_username', 'reviewed_by',
            'rejection_reason', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """
        Validate that from_date is before or equal to to_date.
        """
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        
        if from_date and to_date and from_date > to_date:
            raise serializers.ValidationError("From date cannot be after to date.")
            
        return data
    
    def create(self, validated_data):
        """
        Create and return a new AttendanceClaim instance, given the validated data.
        """
        # Set the current user as the claim creator
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Update and return an existing AttendanceClaim instance, given the validated data.
        Only staff users can update the status and rejection_reason.
        """
        user = self.context['request'].user
        status = validated_data.get('status')
        
        # Only allow staff to update status and rejection_reason
        if status and not user.is_staff:
            validated_data.pop('status')
            validated_data.pop('rejection_reason', None)
        
        # If status is being updated to APPROVED/REJECTED, set reviewed_by
        if status in ['APPROVED', 'REJECTED'] and not instance.reviewed_by:
            validated_data['reviewed_by'] = user
        
        return super().update(instance, validated_data)

class PartialCompletionCertificateSerializer(serializers.ModelSerializer):
    tasks_completed = TaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = PartialCompletionCertificate
        fields = '__all__'
        read_only_fields = ('issue_date', 'is_approved', 'approved_by')

class TaskCertificateSerializer(serializers.Serializer):
    emp_id = serializers.CharField(max_length=10, required=True)
    performance_comment = serializers.CharField(required=False, default="outstanding performance")

class AttendanceCertificateSerializer(serializers.Serializer):
    emp_id = serializers.CharField(max_length=10, required=True)

class PartialCertificateSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(write_only=True)

    class Meta:
        model = PartialCompletionCertificate
        fields = [
            'emp_id','start_date', 'end_date', 'remarks', 
            'is_approved', 'approved_by', 'completion_percentage'
        ]
        read_only_fields = ['user', 'issue_date', 'tasks_completed']

    def create(self, validated_data):
        emp_id = validated_data.pop('emp_id')
        intern = Temp.objects.get(emp_id=emp_id)
        validated_data['user'] = intern.user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Temp
        fields = ['emp_id', 'user', 'role']