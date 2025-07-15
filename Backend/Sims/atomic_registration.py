# Enhanced registration view with atomic transactions
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

class AtomicInternRegistrationView(APIView):
    """
    Complete intern registration in a single atomic transaction
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        """
        Register intern with all required data in a single transaction
        """
        try:
            # Extract data from request
            user_data = request.data.get('user_data', {})
            personal_data = request.data.get('personal_data', {})
            college_data = request.data.get('college_data', {})
            company_data = request.data.get('company_data', {})
            
            # Validate required fields
            required_user_fields = ['username', 'email', 'password', 'first_name', 'last_name']
            for field in required_user_fields:
                if not user_data.get(field):
                    return Response(
                        {"error": f"{field} is required"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Check if user already exists
            if User.objects.filter(username=user_data['username']).exists():
                return Response(
                    {"error": "Username already exists"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create User
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name']
            )
            
            # Create UserProfile
            UserProfile.objects.create(user=user)
            
            # Generate emp_id and create Temp record
            department_name = user_data.get('department', 'General')
            department, created = Department.objects.get_or_create(
                department__iexact=department_name.strip(),
                defaults={'department': department_name.strip()}
            )
            
            emp_id = generate_emp_id('intern', department)
            temp_obj = Temp.objects.create(
                user=user,
                emp_id=emp_id,
                role='intern'
            )
            
            # Create PersonalData
            if personal_data:
                PersonalData.objects.create(
                    emp_id=temp_obj,
                    user=user,
                    phone_no=personal_data.get('phone_no', 0),
                    aadhar_number=personal_data.get('aadhar_number'),
                    gender=personal_data.get('gender', 'M'),
                    address1=personal_data.get('address1', ''),
                    address2=personal_data.get('address2', ''),
                    pincode=personal_data.get('pincode', ''),
                    date_of_birth=personal_data.get('date_of_birth'),
                    first_Graduation=personal_data.get('first_Graduation', False)
                )
            
            # Create CollegeDetails
            if college_data:
                CollegeDetails.objects.create(
                    emp_id=temp_obj,
                    college_name=college_data.get('college_name', ''),
                    college_address=college_data.get('college_address', ''),
                    college_email_id=college_data.get('college_email_id'),
                    degree=college_data.get('degree', ''),
                    college_department=college_data.get('college_department', ''),
                    degree_type=college_data.get('degree_type', 'UG'),
                    year_of_passing=college_data.get('year_of_passing'),
                    cgpa=college_data.get('cgpa'),
                    college_faculty_phonenumber=college_data.get('college_faculty_phonenumber')
                )
            
            # Create UserData
            user_data_obj = UserData.objects.create(
                emp_id=temp_obj,
                user=user,
                department=department,
                domain=Domain.objects.filter(domain=company_data.get('domain')).first(),
                scheme=company_data.get('scheme', 'FREE'),
                start_date=company_data.get('start_date'),
                end_date=company_data.get('end_date'),
                duration=company_data.get('duration'),
                days=company_data.get('working_days'),
                shift_timing=company_data.get('shift_timing'),
                team_name=company_data.get('team_name'),
                user_status='active'
            )
            
            # Log the successful registration
            log_activity(
                request.user,
                "Created",
                "Complete Intern Registration",
                temp_obj.emp_id,
                f"Successfully registered intern {emp_id}",
                request
            )
            
            return Response({
                "message": "Intern registered successfully",
                "emp_id": emp_id,
                "username": user.username,
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Transaction will be rolled back automatically
            return Response(
                {"error": f"Registration failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )