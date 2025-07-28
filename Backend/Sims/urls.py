from django.urls import path
from . import views
from .views import generate_offer_letter_api
from .views import generate_completed_certificate
from .views import CollegeDetailsView
from .views import UserPermissionsView

urlpatterns = [
     path("user/update/<str:emp_id>/", views.UserUpdateView.as_view(), name='user-update'),
    path("generate-completed-certificate/<str:emp_id>/",
         generate_completed_certificate, name="generate_completed_certificate"),
    path('generate-offer-letter/', generate_offer_letter_api,
         name='generate_offer_letter_api'),
    path('temps/', views.TempView.as_view(), name='temp-list'),
    path('temps/<str:emp_id>/', views.TempView.as_view(), name='temp-detail'),
    # POST, GET all (depending on role)
    path("Sims/college-details/", CollegeDetailsView.as_view()),
    path("Sims/college-details/<str:emp_id>/", CollegeDetailsView.as_view()),
    path('personal-data/', views.PersonalDataView.as_view(),
         name='personal-data-list'),
    path('personal-data/<str:emp_id>/', views.PersonalDataView.as_view(),
         name='personal-data-detail'),  # Corrected

    path('all-user-data/', views.AllUserDataView.as_view(), name='all-user-data'),
    path('user-data/', views.UserDataView.as_view(), name='user-data-list'),
    path('user-data/<str:emp_id>/', views.UserDataView.as_view(),
         name='user-data-detail'),  # Corrected

    path("Sims/college-details/", CollegeDetailsView.as_view()),
    path("Sims/college-details/<str:emp_id>/",
         CollegeDetailsView.as_view()),  # Corrected

    path('college-details/', views.CollegeDetailsView.as_view(),
         name='college-details-list'),
    path('college-details/<str:emp_id>/', views.CollegeDetailsView.as_view(),
         name='college-details-detail'),


    path('assert-stock/', views.AssertStockView.as_view(),
         name='assert-stock-list'),
    path('assert-stock/<str:pk>/', views.AssertStockView.as_view(),
         name='assert-stock-detail'),

    path('assert-issue/', views.AssertIssueView.as_view(),
         name='assert-issue-list'),
    path('assert-issue/<uuid:pk>/', views.AssertIssueView.as_view(),
         name='assert-issue-detail'),

    path('fees/', views.FeesView.as_view(), name='fees-list'),
    path('fees/<uuid:pk>/', views.FeesView.as_view(), name='fees-detail'),

    path('fee-structure/', views.FeeStructureView.as_view(),
         name='fee-structure-list'),
    path('fee-structure/<uuid:pk>/', views.FeeStructureView.as_view(),
         name='fee-structure-detail'),



# Attendance Endpoints
    path('attendance/', views.AttendanceView.as_view(), name='attendance-list'),
    path('attendance/<uuid:attendance_id>/', views.AttendanceView.as_view(), name='attendance-detail'),
    path('attendance/<str:emp_id>/', views.AttendanceView.as_view(), name='attendance-list'),

    # Leave Request Endpoints
   # Leave Request Endpoints
    path('attendances/user/', views.UserAttendanceView.as_view(), name='user-attendance'),
    path('attendances/leave_balance/', views.get_leave_balance, name='leave-balance'),
# ---------------------------------------------
    path("attendances/leave_request/", views.LeaveRequestView.as_view(), name="leave_request"),
    path("attendances/leave_approval/", views.LeaveApprovalView.as_view(), name="leave_approval"),
    path("attendances/leave_approval/<int:leave_id>/", views.LeaveApprovalView.as_view(), name="leave_approval"),
    
    path('attendances/leave_history/', views.LeaveHistoryView.as_view(), name='leave-history'),
    path('attendances/leave_history/<emp_id>/', views.LeaveHistoryView.as_view(), name='leave-history-detail'),
    path('leave-status/', views.LeaveStatusView.as_view(), name='leave-status'),
    path('performance/', views.PerformanceView.as_view(), name='performance-list'),




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


    

    path('password-reset/request/', views.ResetPasswordOTPRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/', views.VerifyOTPView.as_view(), name='password-reset-verify'),
    path('password-reset/update/', views.UpdatePasswordView.as_view(), name='password-reset-update'),

    path('domains/', views.DomainView.as_view(), name='domain-list'),
    path('tasks/monthly-count/', views.MonthlyTaskCountView.as_view(), name='weekly-task-count'),
    path('domains/<uuid:pk>/', views.DomainView.as_view(), name='domain-detail'),

    path('intern-count-by-domain/', views.InternCountByDomainView.as_view(), name='intern-count-by-domain'),
    path('staffs-details/', views.StaffDetailsView.as_view(), name='staff-detail'),

    path('assert-stock-count/', views.AssertStockCountView.as_view(), name='assert-stock-count'),
    path('asset-trend/', views.AssetTrendView.as_view(), name='asset-trend'),
    path("available-assets/", views.AvailableAssetCountView.as_view(), name="available-assets"),


    path('feedback/', views.FeedbackView.as_view(), name='feedback-list'),
    path('feedback/<uuid:feedback_id>/', views.FeedbackView.as_view(), name='feedback-detail'),


    path('departments/', views.DepartmentView.as_view(), name='department-list'),
    path('departments/<uuid:pk>/', views.DepartmentView.as_view(), name='department-detail'),





    path('documents/', views.DocumentView.as_view(), name='documents-list'),
    path('documents/<uuid:pk>/', views.DocumentView.as_view(), name='document-detail'),
    path('documents/emp/<str:emp_id>/', views.DocumentByEmpView.as_view(), name='documents-by-emp'),






    path('emp-email/<str:emp_id>/', views.EmpEmailLookupView.as_view(), name='emp-email-lookup'),



    path('tasks/assigned-history/', views.AssignedTaskHistoryView.as_view(), name='assigned-task-history'),
    path('tasks/assigned-history/<uuid:pk>/', views.AssignedTaskHistoryView.as_view(), name='assigned-task-delete'),

    path('staffs-by-department/', views.StaffListByDepartmentView.as_view(), name='admin-staffs-by-department'),
    path('domains-by-department/', views.DomainByDepartmentView.as_view(), name='admin-domains-by-department'),

    path('documents/<uuid:pk>/download/', views.download_document, name='document-download'),

    path('available-interns/<str:department_name>/', views.interns_without_asset_in_department, name='available-interns'),


    path('attendancedaterange/', views.AttendanceDateRangeView.as_view(), name='attendance-daterange'),
    path('fulldetail/', views.UserDetailView.as_view(), name='full-detail'),

    path('attendanceanalysis/',views.AttendanceAnalysisView.as_view(),name='attendance-analysis-refresh'),
    path('simpleattendancedata/',views.SimpleAttendanceTimesView.as_view(), name='simple-data-attendance'),


    path('asset-logs/', views.AssertAssignmentLogView.as_view(), name='asset-logs'),


    path('asserthistory/',views.AssertAllTimeHistoryView.as_view(),name='asset-history'),
    path('assertuserhistory/',views.UserAssertAllTimeHistoryView.as_view(),name='asset-user-history'),

    path('deleted-users/', views.DeletedUsersView.as_view(), name='deleted-users'),
    path('user-permissions/', UserPermissionsView.as_view(), name='user-permissions'),
]
