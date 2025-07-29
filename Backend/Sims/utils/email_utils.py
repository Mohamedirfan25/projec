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
from docx import Document
import tempfile
import uuid
from datetime import date

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
            error_msg = "Invalid date format. Please use YYYY-MM-DD. Error: {str(e)}"
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


def generate_offer_letter_docx(user, emp_id, college_name, start_date, end_date,
                            position_title="FullStack Intern",
                            domain="VDart Academy",
                            shift_time="9:00 AM to 1:00 PM IST",
                            shift_days="Monday to Friday",
                            work_location="VDart, Global Capability Center, Mannarpuram",
                            reporting_to="Derrick Alex"):
    """
    Generate an offer letter using a Word template with the following placeholders:
    - {{intern_prefix}}{{intern_name}}
    - {{intern_id}}, {{intern_college}}
    - {{intern_name}}, {{intern_domain}}
    - {{intern_start_date}}
    - {{intern_end_date}}
    - {{intern_shift_time}}
    - {{intern_shift_days}}
    
    Returns:
        tuple: (success: bool, message: str, file_path: str, error_details: dict)
    """
    logger = logging.getLogger(__name__)
    error_details = {
        'step': 'Initialization',
        'error_type': None,
        'message': None
    }
    
    try:
        # Define the template path
        template_path = r'C:\Users\User\projec\Backend\media\word docs\VDart_Offer_Letter_ACA030 (1).docx'
        
        # Check if template exists
        if not os.path.exists(template_path):
            error_msg = f"Template file not found at {template_path}"
            logger.error(error_msg)
            error_details.update({
                'step': 'Template Validation',
                'error_type': 'File Not Found',
                'message': error_msg,
                'template_path': template_path,
                'template_exists': False
            })
            return False, error_msg, None, error_details
            
        # Create temp directory if it doesn't exist
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp_offer_letters')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate output file path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"Offer_Letter_{emp_id}_{timestamp}.docx"
        output_path = os.path.join(temp_dir, output_filename)
        
        try:
            # Load the template
            doc = Document(template_path)
            
            # Define placeholder mapping - these must match exactly with the template
            full_name = f"{user.first_name} {user.last_name}"
            
            # 1. Get gender prefix - using direct query to PersonalData
            gender_prefix = 'Ms.'  # Default prefix
            try:
                from ..models import PersonalData  # Adjusted import path
                personal_data = PersonalData.objects.filter(user_id=user.id).first()
                if personal_data and personal_data.gender == 'M':
                    gender_prefix = 'Mr.'
                logger.info(f"Gender prefix set to: {gender_prefix} for user {user.id}")
            except Exception as e:
                logger.error(f"Error getting gender prefix: {str(e)}", exc_info=True)
            
            # 2. Format dates
            def format_date(date_val):
                if not date_val:
                    return ""
                try:
                    # If it's a string, parse it to datetime
                    if isinstance(date_val, str):
                        try:
                            # Try parsing with dateutil.parser which handles multiple formats
                            date_val = parser.parse(date_val)
                        except Exception as e:
                            logger.warning(f"Could not parse date string: {date_val}. Error: {str(e)}")
                            return date_val  # Return as is if can't parse
                    
                    # If it's a date/datetime object, format it
                    if hasattr(date_val, 'strftime'):
                        return date_val.strftime('%d-%b-%Y')  # Format as 30-Jul-2025
                    
                    return str(date_val)
                except Exception as e:
                    logger.error(f"Error formatting date {date_val}: {str(e)}", exc_info=True)
                    return str(date_val)
            
            # 3. Format shift days
            def format_shift_days(days):
                if not days:
                    return "Monday to Friday"  # Default value
                try:
                    # Convert to string and clean up
                    days = str(days).strip()
                    if not days:
                        return "Monday to Friday"
                        
                    # If already in a range format, capitalize properly
                    if any(sep in days.lower() for sep in [' to ', '-']):
                        # Capitalize first letter of each word
                        return ' '.join(word.capitalize() for word in days.split())
                    
                    # Handle comma-separated days
                    days_list = [d.strip().capitalize() for d in days.split(',') if d.strip()]
                    if len(days_list) > 1:
                        return f"{days_list[0]} to {days_list[-1]}"
                    elif days_list:
                        return days_list[0]
                        
                    return "Monday to Friday"  # Fallback
                except Exception as e:
                    logger.error(f"Error formatting shift days '{days}': {str(e)}", exc_info=True)
                    return "Monday to Friday"
            
            # Format the values
            formatted_start_date = format_date(start_date)
            formatted_end_date = format_date(end_date)
            formatted_shift_days = format_shift_days(shift_days)
            
            logger.info(f"""
                Placeholder values before replacement:
                - Gender Prefix: {gender_prefix}
                - Start Date: {start_date} -> {formatted_start_date}
                - End Date: {end_date} -> {formatted_end_date}
                - Shift Days: {shift_days} -> {formatted_shift_days}
            """)
            
            placeholder_map = {
                '{{intern_prefix}}': gender_prefix,
                '{{intern_name}}': full_name,
                '{{intern_id}}': str(emp_id),
                '{{intern_college}}': str(college_name),
                '{{intern_domain}}': str(domain),
                '{{intern_start_date}}': formatted_start_date,
                '{{intern_end_date}}': formatted_end_date,
                '{{intern_shift_time}}': str(shift_time or "9:00 AM to 1:00 PM IST"),
                '{{intern_shift_days}}': formatted_shift_days,
                '{{intern_work_location}}': str(work_location),
                '{{intern_reporting_to}}': str(reporting_to)
            }
            
            # Replace placeholders in paragraphs
            for paragraph in doc.paragraphs:
                for placeholder, value in placeholder_map.items():
                    if placeholder in paragraph.text:
                        paragraph.text = paragraph.text.replace(placeholder, str(value))
            
            # Replace placeholders in tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        for placeholder, value in placeholder_map.items():
                            if placeholder in cell.text:
                                cell.text = cell.text.replace(placeholder, str(value))
            
            # Save the document
            doc.save(output_path)
            
            logger.info(f"Successfully generated offer letter at {output_path}")
            return True, "Offer letter generated successfully", output_path, None
            
        except Exception as e:
            error_msg = f"Error generating offer letter: {str(e)}"
            logger.error(error_msg, exc_info=True)
            error_details.update({
                'step': 'Document Generation',
                'error_type': 'Document Processing Error',
                'message': str(e),
                'template_path': template_path,
                'template_exists': True,
                'traceback': traceback.format_exc(),
                'placeholders_used': list(placeholder_map.keys()) if 'placeholder_map' in locals() else 'Not available',
                'placeholders_found': 'Check template for exact placeholder usage',
                'template_sample': 'Check for placeholders in the Word template document'
            })
            return False, error_msg, None, error_details
            
    except Exception as e:
        error_msg = f"Unexpected error in generate_offer_letter_docx: {str(e)}"
        logger.error(error_msg, exc_info=True)
        error_details.update({
            'step': 'Unexpected Error',
            'error_type': 'Unexpected Error',
            'message': str(e),
            'template_path': template_path if 'template_path' in locals() else 'Not determined',
            'template_exists': os.path.exists(template_path) if 'template_path' in locals() else False,
            'traceback': traceback.format_exc(),
            'placeholders_expected': [
                '{{intern_prefix}}{{intern_name}}',
                '{{intern_id}}',
                '{{intern_college}}',
                '{{intern_name}}',
                '{{intern_domain}}',
                '{{intern_start_date}}',
                '{{intern_end_date}}',
                '{{intern_shift_time}}',
                '{{intern_shift_days}}',
                '{{intern_work_location}}',
                '{{intern_reporting_to}}'
            ]
        })
        return False, error_msg, None, error_details


def send_offer_letter(user, emp_id, college_name, start_date, end_date,
                    position_title="FullStack Intern",
                    domain="VDart Academy",
                    shift_time="9:00 AM to 1:00 PM IST",
                    shift_days="Monday to Friday",
                    work_location="VDart, Global Capability Center, Mannarpuram",
                    reporting_to="Derrick Alex"):
    """
    Main function to generate and send offer letter using Word template.
    
    Returns:
        tuple: (success: bool, message: str, error_details: dict)
    """
    # First generate the offer letter
    success, message, file_path, error_details = generate_offer_letter_docx(
        user=user,
        emp_id=emp_id,
        college_name=college_name,
        start_date=start_date,
        end_date=end_date,
        position_title=position_title,
        domain=domain,
        shift_time=shift_time,
        shift_days=shift_days,
        work_location=work_location,
        reporting_to=reporting_to
    )
    
    if not success:
        return success, message, error_details
    
    # If generation was successful, send the email
    try:
        email_subject = f"Internship Offer Letter - {user.get_full_name()}"
        email_body = f"""
        Dear {user.get_full_name()},
        
        Please find attached your internship offer letter.
        
        Best regards,
        VDart HR Team
        """
        
        email = EmailMessage(
            email_subject,
            email_body,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            cc=[settings.HR_EMAIL] if hasattr(settings, 'HR_EMAIL') else None
        )
        
        # Attach the offer letter
        with open(file_path, 'rb') as f:
            email.attach(
                f"Offer_Letter_{emp_id}.docx",
                f.read(),
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
        
        # Send the email
        email.send(fail_silently=False)
        
        # Clean up the temporary file
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to delete temporary file {file_path}: {str(e)}")
        
        logger.info(f"Successfully sent offer letter to {user.email}")
        return True, "Offer letter has been sent successfully.", None
        
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Clean up the temporary file even if sending failed
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        except Exception as cleanup_error:
            logger.warning(f"Failed to delete temporary file {file_path}: {str(cleanup_error)}")
        
        error_details = {
            'step': 'Email Sending',
            'error_type': 'Email Error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }
        return False, "Failed to send offer letter. Please try again.", error_details