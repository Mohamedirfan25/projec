from django.db import models
import uuid
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import random
from django.core.validators import MinValueValidator

class UserProfile(models.Model):
    USER_ROLES = (
        ('admin', 'admin'),
        ('staff', 'staff'),
        ('intern', 'intern'),
        ('hr','hr'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    def __str__(self):
        return f"{self.user.username} "

    @property
    def is_admin(self):
        try:
            temp = Temp.objects.get(user=self.user)
            return temp.role.lower() == 'admin'
        except Temp.DoesNotExist:
            return False

    @property
    def is_staff(self):
        try:
            temp = Temp.objects.get(user=self.user)
            return temp.role.lower() == 'staff'
        except Temp.DoesNotExist:
            return False

    @property
    def is_intern(self):
        try:
            temp = Temp.objects.get(user=self.user)
            return temp.role.lower() == 'intern'
        except Temp.DoesNotExist:
            return False

class Temp(models.Model):
    is_deleted = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    emp_id = models.CharField(max_length=10, primary_key=True)  # Now a string, e.g., ACA001, STAFF001
    role = models.CharField(max_length=20, choices=UserProfile.USER_ROLES, default="intern")
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    def __str__(self):
        return f"{self.emp_id} - {self.user.username} -{self.role}"



class PersonalData(models.Model):
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emp_id = models.ForeignKey(Temp, on_delete=models.CASCADE, to_field='emp_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Changed to reference User's id
    phone_no = models.IntegerField()
    aadhar_number = models.BigIntegerField(null=True,blank=True)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')])
    address1 = models.TextField(null=True, blank=True)
    address2 = models.TextField(null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    first_Graduation = models.BooleanField(default=False)
    photo = models.ImageField(null=True,upload_to='photos/')
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    def __str__(self):
        return f"Personal Data - {self.emp_id}"


class Domain(models.Model):
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey('Department', on_delete=models.CASCADE, null=True, to_field="department")
    domain = models.CharField(max_length=100, unique=True)  # No longer a primary key
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['domain', 'department'],
                name='unique_domain_per_department'
            )
        ]

    def __str__(self):
        return f"{self.domain}"



class UserData(models.Model):
    is_deleted = models.BooleanField(default=False)
    USER_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inprogress', 'In Progress'),
        ('completed', 'Completed'),
        ('yettojoin', 'Yet to Join'),
        ('holdandwait', 'Hold and Wait'),
        ('discontinued', 'Discontinued'),
        ('deleted', 'Deleted'),
    ]
    SCHEME_CHOICES = [
        ('FREE', 'Free'),
        ('COURSE', 'Course'),
        ('PROJECT', 'Project')
    ]
    department = models.ForeignKey('Department', on_delete=models.CASCADE, null=True, to_field="department")
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emp_id = models.ForeignKey(Temp, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    asset_code = models.ForeignKey('AssertStock', on_delete=models.CASCADE, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    duration = models.CharField(max_length=50,null=True,blank=True)
    days = models.CharField(max_length=50,blank=True,null=True)
    shift_timing = models.CharField(max_length=50,null=True,blank=True)
    #domain = models.CharField(max_length=250,default="Free")
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, null=True, to_field="domain")
    
    # # Add scheme field to associate with fee structure
    scheme = models.CharField(max_length=50, choices=SCHEME_CHOICES, default='FREE',null=True,blank=True)
    team_name = models.CharField(max_length=255,null=True,blank=True)
    reporting_manager = models.ForeignKey(User, on_delete=models.CASCADE, null=True,related_name='managed_user_data')
    reporting_supervisor = models.ForeignKey(User, on_delete=models.CASCADE, null=True,related_name='supervised_user_data')
    user_status = models.CharField(max_length=15, choices=USER_STATUS_CHOICES, default='active')  # New field
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    is_attendance_access = models.BooleanField(default=True,null=True,blank=True)
    is_payroll_access = models.BooleanField(default=True,null=True,blank=True)
    is_internmanagement_access = models.BooleanField(default=True,null=True,blank=True)
    is_assert_access = models.BooleanField(default=True,null=True,blank=True)


    def __str__(self):
        return f"{self.user} - {self.emp_id.role} - {self.user_status}"
    

class CollegeDetails(models.Model):
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emp_id = models.ForeignKey('Temp', on_delete=models.CASCADE, null=True)
    college_address = models.CharField(max_length=255)
    college_email_id = models.EmailField(null=True,blank=True)
    college_name = models.CharField(max_length=255)
    degree = models.CharField(max_length=100)
    college_department = models.CharField(max_length=100)
    degree_type = models.CharField(null=True,max_length=100, choices=[('UG', 'Undergraduate'), ('PG', 'Postgraduate'), ('Others', 'Others')])
    year_of_passing = models.IntegerField(null=True, blank=True)
    cgpa=models.DecimalField(max_digits=4, decimal_places=2, validators=[MinValueValidator(0.0)], null=True, blank=True)
    college_faculty_phonenumber = models.IntegerField(null=True, blank=True)
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    def __str__(self):
        return f"{self.emp_id.emp_id} - {self.college_name} ({self.degree}) "
    
    


class AssertStock(models.Model):
    is_deleted = models.BooleanField(default=False)
    assert_id = models.CharField(max_length=255, unique=True, primary_key=True)
    configuration = models.CharField(max_length=100)
    assert_model = models.CharField(max_length=255)
    inhand = models.BooleanField(default=True)
    emp_id = models.ForeignKey('Temp', on_delete=models.CASCADE, default=None, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # changed to reference User's id, added blank=True
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    department = models.ForeignKey('Department', on_delete=models.CASCADE, null=True, to_field="department")
    assignment_history = models.TextField(blank=True, null=True)
    allocated_type=models.CharField(max_length=50,null=True,choices=[('Laptop', 'Laptop'), ('Mouse', 'Mouse'),('Charger', 'Charger'),('Headphone', 'Headphone')])
    

    def update_assignment_history(self, emp_id):
        if self.assignment_history:
            self.assignment_history += f", {emp_id}"
        else:
            self.assignment_history = str(emp_id)
        self.save()

    def __str__(self):
        return f"{self.assert_model} ({self.configuration}) - {self.assert_id}"

class AssertIssue(models.Model):
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assert_id = models.ForeignKey('AssertStock', on_delete=models.CASCADE, to_field='assert_id', db_column='assert_id')
    issue = models.CharField(max_length=255)
    allocated_type=models.CharField(max_length=50,null=True,choices=[('Laptop', 'Laptop'), ('Mouse', 'Mouse'),('Charger', 'Charger'),('Headphone', 'Headphone')])
    condition = models.CharField(max_length=50, choices=[('Usable', 'Usable'), ('Not Usable', 'Not Usable')])
    it_support = models.CharField(max_length=50, choices=[('Hand Over', 'Hand Over'), ('In Hand', 'In Hand')])
    alternate_laptop = models.CharField(max_length=255, null=True, blank=True)
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)

    def _str_(self):
        return f"Assert Issue for {self.assert_id} - {self.issue}"    

class FeeStructure(models.Model):
    SCHEME_CHOICES = [
        ('FREE', 'FREE'),
        ('COURSE', 'COURSE'),
        ('PROJECT', 'PROJECT')  
    ]
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE,null=True,to_field="domain")
    scheme = models.CharField(max_length=255, choices=SCHEME_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.0)])
    created_date = models.DateField(auto_now_add=True,null=True)
    updated_date = models.DateField(auto_now=True)

    def __str__(self):
        return f"{self.domain.domain} - {self.get_scheme_display()} - {self.price}"

class Fees(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('ONLINE', 'Online Payment')
    ]
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emp_id = models.ForeignKey(Temp, on_delete=models.CASCADE,null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE,null=True)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE,null=True,to_field="domain")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE,null=True)
    # fee_type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.0)],null=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    paid_date = models.DateTimeField(default=timezone.now)
    # total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    created_date = models.DateField(auto_now=True)
    updated_date = models.DateField(auto_now=True)

    def __str__(self):
        return f"Fee for {self.emp_id}"



class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ]

    PRESENT_STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Null', 'Null')  # Default when status is unclear
    ]

    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    emp_id = models.ForeignKey('Temp', on_delete=models.CASCADE, null=True)
    date = models.DateField(auto_now_add=True)
    check_in = models.DateTimeField(default=timezone.now, null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    total_hours = models.DurationField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    remaining_leave_count=models.IntegerField(default=5)
    max_leave_count = models.IntegerField(default=5)
    leaves_taken = models.FloatField(default=0)
    leave_request = models.ForeignKey('LeaveRequest',on_delete=models.SET_NULL,null=True,blank=True,related_name='attendance_records')
    present_status = models.CharField(max_length=20, choices=PRESENT_STATUS_CHOICES, default='Null')  # Attendance status
    

    # models.py (Attendance model)
    def save(self, *args, **kwargs):
        # If marking as absent without an approved leave request
        if self.present_status == "Absent" and not self.leave_request:
            latest_attendance = (
                Attendance.objects.filter(emp_id=self.emp_id)
                .order_by('-date')
                .first()
            )
            remaining = latest_attendance.remaining_leave_count if latest_attendance else 5
            self.remaining_leave_count = max(0, remaining - 1)
        
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.name} - {self.date}  - Attendance: {self.present_status}"



class Task(models.Model):
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks_assigned_by')
    committed_date = models.DateField()
    start_date = models.DateField(null=True,blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('Under_Review', 'Under_Review'), ('In_Progress', 'In_Progress'), ('Completed', 'Completed'), ('Missing', 'Missing'), ('Not_Started','Not_Started')], default='Not_Started')
    hours_committed = models.DecimalField(max_digits=5, decimal_places=2,null=True,blank=True)
    days_committed = models.CharField(max_length=255,null=True,blank=True)
    task_description = models.TextField()
    task_title = models.CharField(max_length=255)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)

    def __str__(self):
        return f"Task: {self.task_title} - Assigned to {self.assigned_to.username} - Priority: {self.priority}"

class Log(models.Model):
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    table_name = models.CharField(max_length=255)
    action = models.CharField(max_length=50)
    old_data = models.TextField()
    new_data = models.TextField()
    user_name = models.CharField(max_length=255)
    updated_date = models.DateField(auto_now=True)

    def __str__(self):
        return f"Log for {self.user_name} on {self.table_name} - {self.action}"




class PasswordResetOTP(models.Model):
    is_deleted = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)  # 6-digit OTP
    created_at = models.DateTimeField(auto_now_add=True)
    # verified = models.BooleanField(default=False)

    def is_expired(self):
        # OTP is valid only for 60 seconds
        return timezone.now() > self.created_at + timezone.timedelta(seconds=300)

    def generate_otp(self):
        self.otp = str(random.randint(1000, 9999))
        self.created_at = timezone.now()
        self.save()

    @classmethod
    def resend_otp(cls, user):
        # Invalidate old OTPs
        cls.objects.filter(user=user).delete()
        # Generate a new OTP and save
        new_otp = cls.objects.create(user=user)
        new_otp.generate_otp()
        return new_otp





# Add to models.py - AttendanceLog model
class AttendanceEntries(models.Model):
    REASON_CHOICES = [
        ('BREAK', 'Break'),
        ('LUNCH', 'Lunch'),
        ('END_OF_SHIFT', 'End of Shift'),
        ('MEETING', 'Meeting'),
        ('OTHER', 'Other'),
    ]
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance = models.ForeignKey('Attendance', on_delete=models.CASCADE, related_name='entries')
    emp_id = models.ForeignKey('Temp', on_delete=models.CASCADE)
    check_in = models.DateTimeField(default=timezone.now)
    check_out = models.DateTimeField(null=True, blank=True)
    total_hours = models.DurationField(null=True, blank=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, null=True, blank=True)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    
    def __str__(self):
        return f"{self.emp_id} - {self.check_in.date()} - {self.check_in.time()} to {self.check_out.time() if self.check_out else 'ongoing'} - Reason: {self.get_reason_display() if self.reason else 'N/A'}"






# models.py (Feedback model update)
class Feedback(models.Model):
    RATING_CHOICES = [
        (0.5, '0.5 - Very Poor'),
        (1.0, '1.0 - Poor'),
        (1.5, '1.5 - Below Average'),
        (2.0, '2.0 - Average'),
        (2.5, '2.5 - Fair'),
        (3.0, '3.0 - Good'),
        (3.5, '3.5 - Very Good'),
        (4.0, '4.0 - Excellent'),
        (4.5, '4.5 - Outstanding'),
        (5.0, '5.0 - Exceptional'),
    ]

    # Change rating field to DecimalField
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1,
        choices=RATING_CHOICES
    )
   

    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    feedback_by = models.ForeignKey('Temp', on_delete=models.CASCADE, related_name='feedback_given')
    feedback_to = models.ForeignKey('Temp', on_delete=models.CASCADE, related_name='feedback_received')
    comments = models.TextField()
    
    feedback_date = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=100, blank=True, null=True)  # Type of feedback (e.g., performance, behavior)
    is_private = models.BooleanField(default=False)  # Whether feedback is visible only to management
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('acknowledged', 'Acknowledged')
    ], default='submitted')
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)

    def __str__(self):
        return f"Feedback from {self.feedback_by.user.username} to {self.feedback_to.user.username} ({self.rating}/5)"





class Department(models.Model):
    # DEPARTMENT_CHOICES = [
    #     ('academy', 'Academy'),
    #     ('recruitment', 'Recruitment'),
    #     ('development', 'Development'),
    #     ('services', 'Services'),
    #     ('hr_services', 'HR Services'),
    # ]
    is_deleted = models.BooleanField(default=False)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.CharField(max_length=100, unique=True)
    code_word = models.CharField(max_length=10, null=True, blank=True)  # 
    description=models.CharField(max_length=500,null=True,blank=True)
    created_date = models.DateField(auto_now_add=True)
    updated_date = models.DateField(auto_now=True)
    
    def __str__(self):
        return f"{self.department}"




class LeaveRequest(models.Model):
    LEAVE_TYPES = [
        ('CASUAL', 'Casual Leave'),
        ('SICK', 'Sick Leave'),
        ('EMERGENCY', 'Emergency Leave'),
        ('PERSONAL', 'Personal Leave'),
        ('VACATION', 'Vacation Leave')
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected")
    ]
    is_deleted = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leave_requests")
    reporting_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="manager_leaves")
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    from_date = models.DateField()
    to_date = models.DateField()
    half_day_start = models.BooleanField(default=False)
    half_day_end = models.BooleanField(default=False)
    request_reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    remaining_leave_count = models.IntegerField(default=5, blank=True, null=True)
    number_of_days = models.FloatField(null=True, blank=True)


    def deduct_leave_count(self):
        if self.status == "APPROVED":
            # Calculate total days (including half-day logic)
            total_days = (self.to_date - self.from_date).days + 1
            if self.half_day_start:
                total_days -= 0.5
            if self.half_day_end:
                total_days -= 0.5

            # Fetch the last approved leave request for this user
            last_approved = LeaveRequest.objects.filter(
                user=self.user, 
                status="APPROVED"
            ).exclude(id=self.id).order_by('-to_date').first()

            # Default to 5 if no previous approved leaves
            previous_balance = last_approved.remaining_leave_count if last_approved else 5

            # Update remaining balance for THIS leave request
            self.remaining_leave_count = max(0, previous_balance - total_days)
            self.save()  # Save the LeaveRequest instance, not Attendance



    def __str__(self):
        return f"{self.user.username} - {self.leave_type} - {self.status} - {self.from_date} to {self.to_date}"



#-----------------------------------------------New Documents------------------------------------------------#

class Document(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_deleted = models.BooleanField(default=False)
    declaration_number = models.CharField(max_length=50, unique=True, editable=False)
    title = models.CharField(max_length=255,null=True)
    description = models.TextField()
    uploader = models.ForeignKey(Temp, on_delete=models.CASCADE, related_name='uploaded_documents')  # Required field
    receiver = models.ForeignKey(Temp, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_documents')
    file = models.FileField(upload_to='documents/%Y/%m/%d/',null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.declaration_number:
            self.declaration_number = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        if not self.declaration_number:
            self.declaration_number = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.uploader.emp_id} - {self.declaration_number} - {self.title} - {self.receiver.emp_id if self.receiver else 'N/A'}"

class DocumentVersion(models.Model):
    is_deleted = models.BooleanField(default=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='document_versions/%Y/%m/%d/',null=True)
    version_number = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey('Temp', on_delete=models.CASCADE)
    changes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)

    class Meta:
        unique_together = ('document', 'version_number')

    def __str__(self):
        return f"{self.document.uploader.emp_id} - {self.document.declaration_number} - {self.document.title} - 'version' - {self.version_number}- {self.document.receiver.emp_id if self.document.receiver else 'N/A'}"




class AttendanceLog(models.Model):
    REASON_CHOICES = [
        ('LIVE_ON','Live on'),
        ('LIVE_OFF','Live off'),
        ('START_BREAK', 'Start Break'),
        ('END_BREAK', 'End Break'),
        ('END_LUNCH', 'End Lunch'),
        ('START_LUNCH', 'Start Lunch'),
        ('END_OF_SHIFT', 'End of Shift'),
        ('START_OTHERS', 'Start Others'),
        ('END_OTHER', 'End Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emp_id = models.ForeignKey('Temp', on_delete=models.CASCADE,null=True)
    attendance = models.ForeignKey('Attendance', on_delete=models.CASCADE, related_name='logs')
    time = models.DateTimeField(default=timezone.now)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, null=True, blank=True)
    is_in = models.BooleanField(default=True)  # True for "in", False for "out"
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    
    def __str__(self):
        return f"{self.emp_id} - {self.time} - {'IN' if self.is_in else 'OUT'} - Reason: {self.get_reason_display() if self.reason else 'N/A'}"
    


class AssertAssignmentLog(models.Model):
    EVENT_CHOICES = [
        ('ASSIGNED', 'Assigned'),
        ('RETURNED', 'Returned'),
        ('REPAIR', 'Repair'),
        ('ADDED', 'Added'),
        ('REPAIR_RETURNED','Repair returned'),
        ('ALRIGHT','Alright')
    ]

    asset = models.ForeignKey(AssertStock, on_delete=models.CASCADE, to_field='assert_id')
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Actor (staff/admin)
    emp = models.ForeignKey(Temp, on_delete=models.SET_NULL, null=True, blank=True)  # Affected intern
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.asset.assert_id} - {self.get_event_type_display()} - {self.timestamp}"

class CertificateLog(models.Model):
    CERTIFICATE_TYPES = [
        ('completion', 'Completion Certificate'),
        ('offer', 'Offer Letter'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emp_id = models.ForeignKey(Temp, on_delete=models.CASCADE)
    certificate_type = models.CharField(max_length=20, choices=CERTIFICATE_TYPES)
    sent_date = models.DateField()
    recipient_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.emp_id.emp_id} - {self.certificate_type} - {self.sent_date}"