from django.utils import timezone
from datetime import timedelta
from django.core.mail import EmailMessage
from .models import UserData, Temp, CertificateLog
from django.http import HttpRequest
import logging

logger = logging.getLogger(__name__)

def check_and_send_certificates():
    """Check for completed internships and send certificates"""
    try:
        today = timezone.now().date()
        
        print(f"Today: {today}")
        
        # Get all completed interns (end_date < today)
        completed_interns = UserData.objects.filter(
            emp_id__role='intern',
            end_date__lt=today,
            is_deleted=False
        ).exclude(
            user_status__in=['deleted', 'discontinued']
        ).select_related('emp_id__user')
        
        print(f"All completed interns: {len(completed_interns)}")
        
        # Filter out those who already received certificates
        sent_certificates = CertificateLog.objects.filter(
            certificate_type='completion'
        ).values_list('emp_id', flat=True)
        
        pending_interns = completed_interns.exclude(emp_id__in=sent_certificates)
        
        print(f"Found {len(pending_interns)} interns who need certificates")
        
        for user_data in pending_interns:
            try:
                temp = user_data.emp_id
                user = temp.user
                print(f"Processing intern {temp.emp_id} with end_date {user_data.end_date}")
                
                
                if user.email:
                    print(f"Sending certificate to {user.email}")
                    
                    request = HttpRequest()
                    request.method = 'GET'
                    
                    from .views import generate_completed_certificate
                    response = generate_completed_certificate(request, temp.emp_id)
                    
                    if response.status_code == 200:
                        email = EmailMessage(
                            subject=f'Internship Completion Certificate - {user.first_name} {user.last_name}',
                            body=f'''Dear {user.first_name},

Congratulations on completing your internship at VDart!

Your completion certificate is attached.

Best regards,
VDart Team''',
                            from_email='noreply@vdart.com',
                            to=[user.email]
                        )
                        
                        filename = f"{user.first_name}_{user.last_name}_Certificate.pdf"
                        email.attach(filename, response.content, 'application/pdf')
                        email.send()
                        
                        # Log certificate sent
                        CertificateLog.objects.create(
                            emp_id=temp,
                            sent_date=today,
                            certificate_type='completion',
                            recipient_email=user.email
                        )
                        
                        print(f"Certificate sent to {user.email}")
                else:
                    print(f"No email for intern {temp.emp_id}")
                    
            except Exception as e:
                print(f"Error processing intern {user_data.emp_id}: {str(e)}")
                continue
                
    except Exception as e:
        print(f"Error in check_and_send_certificates: {str(e)}")

def send_certificate_on_admin_login():
    """Called when admin logs in to check and send certificates"""
    check_and_send_certificates()