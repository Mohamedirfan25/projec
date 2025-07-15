from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Temp)
admin.site.register(UserProfile)

admin.site.register(PersonalData)   
admin.site.register(UserData)
admin.site.register(CollegeDetails)
#admin.site.register(Files)
admin.site.register(AssertStock)
admin.site.register(AssertIssue)
admin.site.register(Fees)
admin.site.register(FeeStructure)
admin.site.register(Attendance)
admin.site.register(AttendanceEntries)
admin.site.register(AttendanceLog)
admin.site.register(Task)
admin.site.register(Log)
admin.site.register(Domain)


# admin.site.register(DocumentType)
# admin.site.register(Document)
# admin.site.register(DocumentVersion)
# admin.site.register(DocumentMetadata)
# admin.site.register(ReworkReason)
# admin.site.register(FileApprovalHistory)


admin.site.register(Document)
#admin.site.register(DocumentDescription)
admin.site.register(DocumentVersion)

admin.site.register(Feedback)
admin.site.register(Department)

admin.site.register(LeaveRequest)
admin.site.register(AssertAssignmentLog)