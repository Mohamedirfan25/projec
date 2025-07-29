import os
import traceback
import logging
from io import BytesIO
from datetime import datetime
from django.core.mail import EmailMessage, BadHeaderError
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from dateutil import parser

# Configure logging
logger = logging.getLogger(__name__)

def log_error(error_type, error_message, details=None):
    """Helper function to log errors with consistent formatting"""
    log_message = f"{error_type.upper()}: {error_message}"
    if details:
        log_message += f"\nDetails: {details}"
    logger.error(log_message, exc_info=True)
    return log_message

def send_offer_letter_reportlab(user, emp_id, college_name, start_date, end_date,
                              position_title="FullStack Intern",
                              domain="VDart Academy",
                              shift_time="9:00 AM to 1:00 PM IST",
                              shift_days="Monday to Friday",
                              work_location="VDart, Global Capability Center, Mannarpuram",
                              reporting_to="Derrick Alex"):
    """
    Generate and send an offer letter using ReportLab.
    
    Returns:
        tuple: (success: bool, message: str, error_details: dict)
    """
    error_details = {
        'step': 'Initialization',
        'error_type': None,
        'message': None,
        'traceback': None
    }
    
    try:
        # 1. Input Validation
        error_details['step'] = 'Input Validation'
        required_fields = {
            'user': user,
            'user.email': getattr(user, 'email', None),
            'emp_id': emp_id,
            'college_name': college_name,
            'start_date': start_date,
            'end_date': end_date
        }
        
        missing_fields = [k for k, v in required_fields.items() if not v]
        if missing_fields:
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            log_error('VALIDATION_ERROR', error_msg, required_fields)
            return False, error_msg, error_details

        logger.info(f"Starting offer letter generation for {user.email} (ID: {emp_id})")

        # 2. Date Parsing
        error_details['step'] = 'Date Parsing'
        try:
            if isinstance(start_date, str):
                start_date = parser.parse(start_date).strftime("%d-%b-%Y")
            if isinstance(end_date, str):
                end_date = parser.parse(end_date).strftime("%d-%b-%Y")
            logger.debug(f"Parsed dates - Start: {start_date}, End: {end_date}")
        except Exception as e:
            error_msg = f"Invalid date format. Please use YYYY-MM-DD. Error: {str(e)}"
            log_error('DATE_ERROR', error_msg, {'start_date': start_date, 'end_date': end_date})
            return False, error_msg, error_details

        # 3. Document Generation
        error_details['step'] = 'Document Generation'
        try:
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            def check_page(y):
                if y < 100:  # threshold to start a new page
                    p.showPage()
                    p.setFont("Helvetica", 12)
                    return height - 50
                return y

            # VDart Logo
            logo_path = os.path.join(settings.BASE_DIR, 'Sims', 'static', 'images', 'vdart.png')
            if os.path.exists(logo_path):
                p.drawImage(logo_path, 40, height - 100, width=120, height=50)

            # Address
            p.setFont("Helvetica", 10)
            address = [
                "40, First Floor, 4th Cross,",
                "Raja Colony, Collector's Office Road,",
                "Cantonment, Trichy - 620001",
                "Tamil Nadu, India."
            ]
            y = height - 50
            for line in address:
                p.drawRightString(width - 40, y, line)
                y -= 13
            p.drawRightString(width - 40, y - 5, datetime.now().strftime("%d-%b-%Y"))

            # Title
            p.setFont("Helvetica-Bold", 16)
            p.drawCentredString(width / 2, y - 60, "Internship Offer Letter")

            # Candidate Details
            p.setFont("Helvetica", 12)
            y = y - 90
            p.drawString(40, y, f"Ms. {user.first_name} {user.last_name} ({emp_id}),")
            y = check_page(y)
            p.drawString(40, y - 15, college_name)
            y = y - 50

            # Body
            text = [
                f"Dear {user.first_name} {user.last_name},",
                "",
                "Congratulations!",
                "",
                "We are pleased to offer you the position of Intern with VDart Group.",
                "An internship with VDart Group will provide you with everything you need to start your career adventure.",
                "You'll have the opportunity to experience our company culture, expand your network, and build skills that you'll",
                "be able to apply anywhere. And you won't just be shadowing others — you'll be in the mix right from the start.",
                "",
                "Please find below the confirmation of the specifics of your internship:"
            ]
            for line in text:
                p.drawString(40, y, line)
                y -= 18
                y = check_page(y)

            # Internship Details
            details = [
                ("Position Title", position_title),
                ("Domain", domain),
                ("Start Date", start_date),
                ("End Date", end_date),
                ("Shift Time", shift_time),
                ("Shift Days", shift_days),
                ("Work Location", work_location),
                ("Reporting to", reporting_to),
            ]
            y -= 5
            for key, value in details:
                p.drawString(50, y, f"\u2022  {key} : {value}")
                y -= 16
                y = check_page(y)

            # Notes
            notes = [
                "",
                "Note: Details of your reporting relationship/supervisor, project, responsibilities, etc. will be shared",
                "with you during the induction on day one. At the end of your internship, you will receive a certificate,",
                "and based on your performance there is a high possibility that we will offer you a pre-placement offer.",
                "Should you have any questions, please contact Steve Jackson at 70100 33823 or",
                "email steven.j@vdartinc.com."
            ]
            for line in notes:
                p.drawString(40, y, line)
                y -= 15
                y = check_page(y)

            # Signature
            signature_path = os.path.join(settings.BASE_DIR, 'Sims', 'static', 'images', 'signature.png')
            if os.path.exists(signature_path):
                if y - 100 < 0:
                    p.showPage()
                    y = height - 50
                p.drawImage(signature_path, 40, y - 60, width=150, height=50)
            p.drawString(40, y - 75, "Authorized Signatory")
            p.drawString(40, y - 90, "VDart Group")

            # Acknowledgement
            y = y - 120
            y = check_page(y)
            p.drawString(40, y, "Please acknowledge this email and bring a signed copy of this letter on your start date.")
            y -= 50
            p.drawString(40, y, "Name: ____________________")
            p.drawString(250, y, "Signature: ____________________")
            y -= 25
            p.drawString(40, y, "Date: ____________________")

            # Finalize
            p.showPage()
            p.save()
            buffer.seek(0)
            
        except Exception as e:
            error_msg = "Failed to generate PDF document"
            log_error('PDF_GENERATION_ERROR', error_msg, {'error': str(e)})
            error_details.update({
                'error_type': 'PDF Generation Error',
                'message': str(e),
                'traceback': traceback.format_exc()
            })
            return False, error_msg, error_details

        # 4. Email Sending
        error_details['step'] = 'Email Sending'
        try:
            email = EmailMessage(
                subject=f"Your Internship Offer Letter - {emp_id}",
                body=f"""
                Dear {user.first_name},

                Please find attached your internship offer letter.

                Best regards,
                VDart HR Team
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                cc=['hr@vdartinc.com']
            )
            
            email.attach(
                f"VDart_Offer_Letter_{emp_id}.pdf",
                buffer.getvalue(),
                "application/pdf"
            )
            
            email.send(fail_silently=False)
            logger.info(f"Successfully sent offer letter to {user.email}")
            return True, "Offer letter sent successfully", None
            
        except BadHeaderError as e:
            error_msg = "Invalid email headers"
            log_error('EMAIL_HEADER_ERROR', error_msg, {'error': str(e)})
            error_details.update({
                'error_type': 'Email Header Error',
                'message': str(e)
            })
            return False, error_msg, error_details
            
        except Exception as e:
            error_msg = f"Failed to send email: {str(e)}"
            log_error('EMAIL_SEND_ERROR', error_msg, {
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'to': user.email,
                'error': str(e)
            })
            error_details.update({
                'error_type': 'Email Send Error',
                'message': str(e),
                'traceback': traceback.format_exc()
            })
            return False, error_msg, error_details

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        log_error('UNEXPECTED_ERROR', error_msg, {
            'step': error_details.get('step', 'Unknown'),
            'error': str(e),
            'traceback': traceback.format_exc()
        })
        error_details.update({
            'error_type': 'Unexpected Error',
            'message': str(e),
            'traceback': traceback.format_exc()
        })
        return False, "An unexpected error occurred", error_details

def send_email_with_attachment(
    subject,
    message,
    recipient_list,
    attachment=None,
    filename=None,
    content_type='application/octet-stream',
    from_email=None,
    fail_silently=False,
    **kwargs
):
    """
    Send an email with an attachment.
    
    Args:
        subject (str): Email subject
        message (str): Email body text
        recipient_list (list): List of recipient email addresses
        attachment: File-like object containing the attachment data
        filename (str): Name to give to the attachment
        content_type (str): MIME type of the attachment
        from_email (str): Sender email address (defaults to DEFAULT_FROM_EMAIL)
        fail_silently (bool): If True, exceptions will be caught and logged
        **kwargs: Additional arguments to pass to EmailMessage
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    try:
        from_email = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL')
        
        # Create the email message
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=from_email,
            to=['smanfsaf@gmail.com'],
            **kwargs
        )
        
        # Add attachment if provided
        if attachment and filename:
            # For in-memory files
            if hasattr(attachment, 'read'):
                attachment.seek(0)  # Ensure we're at the start of the file
                email.attach(filename, attachment.read(), content_type)

            # For file paths
            elif isinstance(attachment, str):
                with open(attachment, 'rb') as file:
                    email.attach(filename, attachment.read(), content_type)

        
        # Send the email
        email.send(fail_silently=fail_silently)
        logger.info(f"Email sent successfully to {', '.join(recipient_list)}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}", exc_info=True)
        if not fail_silently:
            raise
        return False