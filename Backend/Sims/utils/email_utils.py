from io import BytesIO
from django.core.mail import EmailMessage
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from datetime import datetime
import os
from django.conf import settings
from dateutil import parser

def send_offer_letter_reportlab(user, emp_id, college_name, start_date, end_date,
                                position_title="FullStack Intern",
                                domain="VDart Academy",
                                shift_time="9:00 AM to 1:00 PM IST",
                                shift_days="Monday to Friday",
                                work_location="VDart, Global Capability Center, Mannarpuram",
                                reporting_to="Derrick Alex"):
    try:
        # Convert ISO string dates to datetime if needed
        if isinstance(start_date, str):
            start_date = parser.parse(start_date).strftime("%d-%b-%Y")
        if isinstance(end_date, str):
            end_date = parser.parse(end_date).strftime("%d-%b-%Y")

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

        # Email Attachment
        email = EmailMessage(
            subject="Your Internship Offer Letter from VDart Group",
            body="Please find attached your internship offer letter.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach(f"VDart_Offer_Letter_{emp_id}.pdf", buffer.getvalue(), "application/pdf")
        email.send()

        return True

    except Exception as e:
        print("Error generating offer letter:", str(e))
        return False