from django.urls import path
from . import views
from . import views_attendance_claim
from .views import generate_offer_letter_api
from .views import generate_completed_certificate
from .views import CollegeDetailsView
from .views import UserPermissionsView, GenerateTaskCertificate, GenerateAttendanceCertificate, GeneratePartialCertificate, UserListView, GenerateCompletionCertificate

urlpatterns = [
    path("user/update/<str:emp_id>/", views.UserUpdateView.as_view(), name='user-update'),
    path("generate-completion-certificate/",
         GenerateCompletionCertificate.as_view(), name="generate_completion_certificate"),
    path('generate-offer-letter/', generate_offer_letter_api,
         name='generate_offer_letter_api'),
    path('generate-task-certificate/', GenerateTaskCertificate.as_view(), name='generate-task-certificate'),
    path('generate-attendance-certificate/', GenerateAttendanceCertificate.as_view(), name='generate-attendance-certificate'),
    path('generate-partial-certificate/', GeneratePartialCertificate.as_view(), name='generate-partial-certificate'),
    path('temps/', views.TempView.as_view(), name='temp-list'),
    path('temps/<str:emp_id>/', views.TempView.as_view(), name='temp-detail'),
    
    # College Details
    path('college-details/', CollegeDetailsView.as_view(), name='college-details-list'),
    path('college-details/<str:emp_id>/', CollegeDetailsView.as_view(), name='college-details-detail'),
    
    # Personal Data
    path('personal-data/', views.PersonalDataView.as_view(), name='personal-data-list'),
    path('personal-data/<str:emp_id>/', views.PersonalDataView.as_view(), name='personal-data-detail'),

    # User Data
    path('users/', UserListView.as_view(), name='user-list'),
    path('all-user-data/', views.AllUserDataView.as_view(), name='all-user-data'),
    path('user-data/', views.UserDataView.as_view(), name='user-data-list'),
    path('user-data/<str:emp_id>/', views.UserDataView.as_view(), name='user-data-detail'),

    # Attendance Endpoints
    path('attendance/', views.AttendanceView.as_view(), name='attendance-list'),
    path('attendance/<uuid:attendance_id>/', views.AttendanceView.as_view(), name='attendance-detail'),
    path('attendance/<str:emp_id>/', views.AttendanceView.as_view(), name='attendance-list'),

    # Leave Request Endpoints
    path('attendances/user/', views.UserAttendanceView.as_view(), name='user-attendance'),
    path('attendances/leave_balance/', views.get_leave_balance, name='leave-balance'),
    path("attendances/leave_request/", views.LeaveRequestView.as_view(), name="leave_request"),
    path("attendances/leave_approval/", views.LeaveApprovalView.as_view(), name="leave_approval"),
    path("attendances/leave_approval/<int:leave_id>/", views.LeaveApprovalView.as_view(), name="leave_approval"),
    
    path('attendances/leave_history/', views.LeaveHistoryView.as_view(), name='leave-history'),
    path('attendances/leave_history/<emp_id>/', views.LeaveHistoryView.as_view(), name='leave-history-detail'),
    path('leave-status/', views.LeaveStatusView.as_view(), name='leave-status'),
    path('performance/', views.PerformanceView.as_view(), name='performance-list'),

    # Logs
    path('logs/', views.LogView.as_view(), name='log-list'),
    path('logs/<str:emp_id>/', views.LogView.as_view(), name='log-detail'),

    # Authentication Endpoints
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("register/",views.RegisterView.as_view(),name="Register-view"),
    path("register/<str:emp_id>/",views.RegisterView.as_view(),name="Register-view"),
    
    # Task Management
    path('tasks/', views.TaskView.as_view(), name='task-list'),
    path('tasks/<uuid:pk>/', views.TaskView.as_view(), name='task-detail'),

    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),


    # Password Reset
    path('password-reset/request/', views.ResetPasswordOTPRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/', views.VerifyOTPView.as_view(), name='password-reset-verify'),
    path('password-reset/update/', views.UpdatePasswordView.as_view(), name='password-reset-update'),

    # Domains
    path('domains/', views.DomainView.as_view(), name='domain-list'),
    path('tasks/monthly-count/', views.MonthlyTaskCountView.as_view(), name='weekly-task-count'),
    path('domains/<uuid:pk>/', views.DomainView.as_view(), name='domain-detail'),

    # Interns
    path('intern-count-by-domain/', views.InternCountByDomainView.as_view(), name='intern-count-by-domain'),
    path('staffs-details/', views.StaffDetailsView.as_view(), name='staff-detail'),

    # Assets
    path('assert-stock/', views.AssertStockView.as_view(), name='assert-stock'),
    path('assert-stock/<str:pk>/', views.AssertStockView.as_view(), name='assert-stock-detail'),
    path('assert-stock-count/', views.AssertStockCountView.as_view(), name='assert-stock-count'),
    path('asset-trend/', views.AssetTrendView.as_view(), name='asset-trend'),
    path("available-assets/", views.AvailableAssetCountView.as_view(), name="available-assets"),

    # Feedback
    path('feedback/', views.FeedbackView.as_view(), name='feedback-list'),
    path('feedback/<uuid:feedback_id>/', views.FeedbackView.as_view(), name='feedback-detail'),

    # Departments
    path('departments/', views.DepartmentView.as_view(), name='department-list'),
    path('departments/<uuid:pk>/', views.DepartmentView.as_view(), name='department-detail'),

    # Documents
    path('documents/', views.DocumentView.as_view(), name='documents-list'),
    path('documents/<uuid:pk>/', views.DocumentView.as_view(), name='document-detail'),
    path('documents/emp/<str:emp_id>/', views.DocumentByEmpView.as_view(), name='documents-by-emp'),

    # Email
    path('emp-email/<str:emp_id>/', views.EmpEmailLookupView.as_view(), name='emp-email-lookup'),
    
    # Asset Lookup
    path('asset-lookup/<str:asset_code>/', views.AssetLookupView.as_view(), name='asset-lookup'),
    path('asset-by-username/<str:username>/', views.AssetByUsernameView.as_view(), name='asset-by-username'),

    # Tasks
    path('tasks/assigned-history/', views.AssignedTaskHistoryView.as_view(), name='assigned-task-history'),
    path('tasks/assigned-history/<uuid:pk>/', views.AssignedTaskHistoryView.as_view(), name='assigned-task-delete'),

    # Staffs
    path('staffs-by-department/', views.StaffListByDepartmentView.as_view(), name='admin-staffs-by-department'),
    path('domains-by-department/', views.DomainByDepartmentView.as_view(), name='admin-domains-by-department'),

    # Document Download
    path('documents/<uuid:pk>/download/', views.download_document, name='document-download'),
    
    # Fees
    path('fees/', views.FeesView.as_view(), name='fees-list'),
    path('fees/<str:emp_id>/', views.FeesView.as_view(), name='fees-detail'),

    # Available Interns
    path('available-interns/<str:department_name>/', views.interns_without_asset_in_department, name='available-interns'),

    # Attendance Date Range
    path('attendancedaterange/', views.AttendanceDateRangeView.as_view(), name='attendance-daterange'),
    path('fulldetail/', views.UserDetailView.as_view(), name='full-detail'),

    # Attendance Analysis
    path('attendanceanalysis/',views.AttendanceAnalysisView.as_view(),name='attendance-analysis-refresh'),
    path('simpleattendancedata/',views.SimpleAttendanceTimesView.as_view(), name='simple-data-attendance'),

    # Asset Logs
    path('asset-logs/', views.AssertAssignmentLogView.as_view(), name='asset-logs'),

    # Asset History
    path('asserthistory/',views.AssertAllTimeHistoryView.as_view(),name='asset-history'),
    path('assertuserhistory/',views.UserAssertAllTimeHistoryView.as_view(),name='asset-user-history'),
    
    # Asset Issue
    path('assert-issue/', views.AssertIssueView.as_view(), name='assert-issue'),
    path('assert-issue/<uuid:pk>/', views.AssertIssueView.as_view(), name='assert-issue-detail'),

    # Deleted Users
    path('deleted-users/', views.DeletedUsersView.as_view(), name='deleted-users'),
    path('user-permissions/', UserPermissionsView.as_view(), name='user-permissions'),
    
    # Attendance Claim URLs
    path('attendance-claims/', views_attendance_claim.AttendanceClaimViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='attendance-claims-list'),
    path('attendance-claims/<uuid:pk>/', views_attendance_claim.AttendanceClaimViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='attendance-claim-detail'),
    path('attendance-claims/<uuid:pk>/approve/', views_attendance_claim.AttendanceClaimViewSet.as_view({
        'post': 'approve'
    }), name='attendance-claim-approve'),
    path('attendance-claims/<uuid:pk>/reject/', views_attendance_claim.AttendanceClaimViewSet.as_view({
        'post': 'reject'
    }), name='attendance-claim-reject'),
    path('attendance-claims/my-claims/', views_attendance_claim.AttendanceClaimViewSet.as_view({
        'get': 'my_claims'
    }), name='my-attendance-claims'),
    path('attendance-claims/pending-approval/', views_attendance_claim.AttendanceClaimViewSet.as_view({
        'get': 'pending_approval'
    }), name='pending-attendance-claims'),
]
