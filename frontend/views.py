from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.db import transaction
import logging
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.db.models.functions import ExtractMonth, ExtractYear  # <-- Add this import

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.generics import GenericAPIView
from rest_framework import generics, permissions


from .models import PasswordResetOTP
from .serializers import ResetPasswordOTPRequestSerializer, VerifyOTPSerializer  # ✅ Use the correct names

from django.db.models import Count, Q
from django.db.models import Q 

import random

logger = logging.getLogger(__name__)

def log_activity(user, action, entity_type, entity_id, description, request):
    try:
        Log.objects.create(
            user_id=user,
            table_name=entity_type,
            action=action,
            old_data="",
            new_data=description,
            user_name=user.username
        )
        logger.info(f"Activity logged: User {user.username} {action} {entity_type} {entity_id} - {description}")
        return True
    except Exception as e:
        logger.error(f"Error logging activity: {e}")
        return False


class TempView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, emp_id=None):
            try:
                user = Temp.objects.get(user=request.user)
                if user.role == "intern":
                    temp = Temp.objects.get(user=user.user)
                    serializer = TempSerializer(temp)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                    
                if emp_id:

                    try:
                        temp = Temp.objects.get(emp_id=emp_id)
                        serializer = TempSerializer(temp)
                        return Response(serializer.data)
                    except Temp.DoesNotExist:
                        return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)
                else:
                    
                        
                    temps = Temp.objects.all()
                    
                    serializer = TempSerializer(temps, many=True)
                    return Response(serializer.data)
            except Temp.DoesNotExist:
                return Response({"error": "No Temp data found for the logged-in user."}, status=status.HTTP_404_NOT_FOUND)


    def post(self, request):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" or user.role=='staff':
            return Response("Intern or staff has no access to this")
        
        user_id = request.data.get('user')
        role = request.data.get('role', 'Intern')  # Default to 'intern' if no role is provided

        try:
            user = User.objects.get(username=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        existing_temp = Temp.objects.filter(user=user).exclude(emp_id=request.data.get('emp_id')).first()
        if existing_temp:
            return Response(
                {"error": f"Temp object already exists for this user with emp_id {existing_temp.emp_id}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TempSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(role=role)

            # Log activity
            log_activity(request.user, "Created", "Temp", serializer.data['emp_id'],
                         f"Created Temp with role {role}", request)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, emp_id):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" or user.role=='staff':
            return Response("Intern or staff has no access to this")
        
        try:
            temp = Temp.objects.get(emp_id=emp_id)
        except Temp.DoesNotExist:
            return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        new_emp_id = request.data.get('emp_id')
        new_user_id = request.data.get('user')

        if new_emp_id and new_emp_id != emp_id:
            if Temp.objects.filter(emp_id=new_emp_id).exists():
                return Response({"error": f"emp_id {new_emp_id} already exists."},
                                status=status.HTTP_400_BAD_REQUEST)

        if new_user_id and new_user_id != temp.user.id:
            try:
                new_user = User.objects.get(id=new_user_id)
                if Temp.objects.filter(user=new_user).exists():
                    return Response({"error": f"User with id {new_user_id} already has a Temp object."},
                                    status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": f"User with id {new_user_id} not found."},
                                status=status.HTTP_404_NOT_FOUND)

        serializer = TempSerializer(temp, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            log_activity(request.user, "Updated", "Temp", emp_id,
                         f"Updated Temp data", request)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, emp_id):
        try:
            user = Temp.objects.get(user=request.user)
            if user.role == "intern" or user.role=='staff':
                return Response("Intern or staff has no access to this")
        
            temp = Temp.objects.get(emp_id=emp_id)
            temp.delete()

            # Log activity
            log_activity(request.user, "Deleted", "Temp", emp_id,
                         f"Deleted Temp record", request)

            return Response({"message": f"Temp record with emp_id {emp_id} deleted successfully"},
                            status=status.HTTP_204_NO_CONTENT)
        except Temp.DoesNotExist:
            return Response({"error": f"Temp record with emp_id {emp_id} not found"},
                            status=status.HTTP_404_NOT_FOUND)


















class UserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def check_user_role(self, username, role_type):
        if not User.objects.filter(username=username).exists():
            return False, Response({"error": f"Reporting {role_type} not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(username=username)
        try:
            temp = Temp.objects.get(user=user)
            if temp.role.lower() == 'intern':
                return False, Response({"error": f"Interns cannot be assigned as reporting {role_type}s"}, status=status.HTTP_400_BAD_REQUEST)
            return True, None
        except Temp.DoesNotExist:
            return False, Response({"error": f"Reporting {role_type} role not found"}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, emp_id=None):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern":
            try:
                user_data = UserData.objects.get(emp_id__emp_id=user.emp_id)
                serializer = UserDataSerializer(user_data)
                return Response(serializer.data)
            except UserData.DoesNotExist:
                return Response({"error": "UserData not found"}, status=status.HTTP_404_NOT_FOUND)
        if emp_id:
            try:
                user_data = UserData.objects.get(emp_id__emp_id=emp_id)
                
                # Check permission for staff users
                if user.role.lower() == 'staff':
                    # Check if the requested user reports to the requesting user
                    if user_data.reporting_manager != request.user:
                        return Response({"error": "You don't have permission to access this employee's data."}, 
                                    status=status.HTTP_403_FORBIDDEN)
                
                serializer = UserDataSerializer(user_data)
                return Response(serializer.data)
            except UserData.DoesNotExist:
                return Response({"error": "UserData not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            if user.role.lower() == 'admin':
                # Admins can see all users
                user_data = UserData.objects.all()
            elif user.role.lower() == 'staff':
                # Staff can only see users reporting to them
                user_data = UserData.objects.filter(reporting_manager=request.user)
            else:
                # For other roles, return empty set
                user_data = UserData.objects.none()
            serializer = UserDataSerializer(user_data, many=True)
            return Response(serializer.data)

    def post(self, request):
    # First, get the logged-in user and their role
        try:
            logged_in_temp = Temp.objects.get(user=request.user)
        except Temp.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        emp_id = request.data.get("emp_id")
        reporting_supervisor = request.data.get("reporting_supervisor")
        reporting_manager = request.data.get("reporting_manager")
        
        # Check if user is an intern and enforce restrictions
        if logged_in_temp.role.lower() == "intern":
            # Interns can only create data for themselves
            if str(emp_id) != str(logged_in_temp.emp_id):
                return Response(
                    {"error": "As an intern, you can only create UserData for yourself"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Interns cannot assign reporting managers or supervisors
            if reporting_manager or reporting_supervisor:
                return Response(
                    {"error": "As an intern, you cannot assign reporting managers or supervisors"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # For other roles, proceed with the current checks
        # Check reporting manager
        if reporting_manager:
            success, response = self.check_user_role(reporting_manager, "manager")
            if not success:
                return response
        
        # Check reporting supervisor
        if reporting_supervisor:
            success, response = self.check_user_role(reporting_supervisor, "supervisor")
            if not success:
                return response
        
        # Existing validation and creation logic follows...
        if not Temp.objects.filter(emp_id=emp_id).exists():
            return Response({"error": "No user found"}, status=status.HTTP_400_BAD_REQUEST)
        
        if UserData.objects.filter(emp_id=emp_id).exists():
            return Response({"error":"Userdata for this emp_id already exists in UserData."}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        temp = get_object_or_404(Temp, emp_id=emp_id)
        user = temp.user
        
        serializer = UserDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['emp_id'] = temp
            serializer.validated_data['user'] = user
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, emp_id):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        
        try:
            user_data = UserData.objects.get(emp_id__emp_id=emp_id)
        except UserData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        # Check reporting manager
        if request.data.get("reporting_manager"):
            success, response = self.check_user_role(request.data.get("reporting_manager"), "manager")
            if not success:
                return response
        
        # Check reporting supervisor
        if request.data.get("reporting_supervisor"):
            success, response = self.check_user_role(request.data.get("reporting_supervisor"), "supervisor")
            if not success:
                return response
        
        serializer = UserDataSerializer(user_data, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, emp_id):
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        try:
            user_data = UserData.objects.get(emp_id__emp_id=emp_id)
        except UserData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        # Check reporting manager
        if request.data.get("reporting_manager"):
            success, response = self.check_user_role(request.data.get("reporting_manager"), "manager")
            if not success:
                return response
        
        # Check reporting supervisor
        if request.data.get("reporting_supervisor"):
            success, response = self.check_user_role(request.data.get("reporting_supervisor"), "supervisor")
            if not success:
                return response
        
        serializer = UserDataSerializer(user_data, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request, emp_id):
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        try:
            user_data = UserData.objects.get(emp_id__emp_id=emp_id)
        except UserData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Log activity before deleting
        log_activity(request.user, "Deleted", "UserData", user_data.id,
                     f"Deleted UserData for emp_id {emp_id}", request)

        user_data.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PersonalDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, emp_id=None):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern":
            try:
                user_data = PersonalData.objects.get(emp_id__emp_id=user.emp_id)
                serializer = PersonalDataSerializer(user_data)
                return Response(serializer.data)
            except PersonalData.DoesNotExist:
                return Response({"error": "PersonalData not found"}, status=status.HTTP_404_NOT_FOUND)
        if emp_id:
            try:
                personal_data = PersonalData.objects.get(emp_id__emp_id=emp_id)
                
                # Check permission for staff users
                if user.role.lower() == 'staff':
                    # Check if the requested user reports to the requesting user
                    if not UserData.objects.filter(emp_id=personal_data.emp_id, reporting_manager=request.user).exists():
                        return Response({"error": "You don't have permission to access this employee's data."}, 
                                    status=status.HTTP_403_FORBIDDEN)
                
                serializer = PersonalDataSerializer(personal_data)
                return Response(serializer.data)
            except PersonalData.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            
        else:
            if user.role.lower() == 'admin':
                # Admins can see all users
                personal_data = PersonalData.objects.all()
            elif user.role.lower() == 'staff':
                # Staff can only see users reporting to them
                reporting_users = User.objects.filter(userdata__reporting_manager=request.user)
                personal_data = PersonalData.objects.filter(user__in=reporting_users)
            else:
                # For other roles, return empty set
                personal_data = PersonalData.objects.none()
            serializer = PersonalDataSerializer(personal_data, many=True)
            return Response(serializer.data)

    def post(self, request):
    # First, get the logged-in user and their role
        try:
            logged_in_temp = Temp.objects.get(user=request.user)
        except Temp.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        emp_id = request.data.get('emp_id')
        if not emp_id:
            return Response({"error": "emp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is an intern and enforce restrictions
        if logged_in_temp.role.lower() == "intern":
            # Interns can only create data for themselves
            if str(emp_id) != str(logged_in_temp.emp_id):
                return Response(
                    {"error": "As an intern, you can only create PersonalData for yourself"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if PersonalData.objects.filter(emp_id=emp_id).exists():
            return Response({"error": "PersonalData already exists for this emp_id"},
                        status=status.HTTP_400_BAD_REQUEST)
        
        temp = get_object_or_404(Temp, emp_id=emp_id)
        user = temp.user
        
        serializer = PersonalDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['emp_id'] = temp
            serializer.validated_data['user'] = user
            serializer.save()
            
            # Log activity
            log_activity(request.user, "Created", "PersonalData", serializer.data['id'],
                        f"Created PersonalData for emp_id {emp_id}", request)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, emp_id):  # Changed parameter to emp_id
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        try:
            personal_data = PersonalData.objects.get(emp_id__emp_id=emp_id)  # Fetch by emp_id
        except PersonalData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = PersonalDataSerializer(personal_data, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            log_activity(request.user, "Updated", "PersonalData", personal_data.id,
                         f"Updated PersonalData for emp_id {emp_id}", request)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, emp_id):  # Changed parameter to emp_id
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        try:
            personal_data = PersonalData.objects.get(emp_id__emp_id=emp_id)  # Fetch by emp_id

            # Log activity before deleting
            log_activity(request.user, "Deleted", "PersonalData", personal_data.id,
                         f"Deleted PersonalData for emp_id {emp_id}", request)

            personal_data.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PersonalData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class CollegeDetailsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, emp_id=None):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern":
            try:
                user_data = CollegeDetails.objects.get(emp_id__emp_id=user.emp_id)
                serializer = CollegeDetailsSerializer(user_data)
                return Response(serializer.data)
            except CollegeDetails.DoesNotExist:
                return Response({"error": "College Details not found"}, status=status.HTTP_404_NOT_FOUND)
        if emp_id:
            try:
                college_details = CollegeDetails.objects.get(emp_id__emp_id=emp_id)
                
                # Check permission for staff users
                if user.role.lower() == 'staff':
                    # Check if the requested user reports to the requesting user
                    temp = college_details.emp_id
                    if not UserData.objects.filter(emp_id=temp, reporting_manager=request.user).exists():
                        return Response({"error": "You don't have permission to access this employee's data."}, 
                                        status=status.HTTP_403_FORBIDDEN)
                
                serializer = CollegeDetailsSerializer(college_details)
                return Response(serializer.data)
            except CollegeDetails.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            if user.role.lower() == 'admin':
                # Admins can see all users
                college_details = CollegeDetails.objects.all()
            elif user.role.lower() == 'staff':
                # Staff can only see users reporting to them
                reporting_users = User.objects.filter(userdata__reporting_manager=request.user)
                reporting_temps = Temp.objects.filter(user__in=reporting_users)
                college_details = CollegeDetails.objects.filter(emp_id__in=reporting_temps)
            else:
                # For other roles, return empty set
                college_details = CollegeDetails.objects.none()
            serializer = CollegeDetailsSerializer(college_details, many=True)
            return Response(serializer.data)

    def post(self, request):
    # First, get the logged-in user and their role
        try:
            logged_in_temp = Temp.objects.get(user=request.user)
        except Temp.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        emp_id = request.data.get('emp_id')
        if not emp_id:
            return Response({"error": "emp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is an intern and enforce restrictions
        if logged_in_temp.role.lower() == "intern":
            # Interns can only create data for themselves
            if str(emp_id) != str(logged_in_temp.emp_id):
                return Response(
                    {"error": "As an intern, you can only create CollegeDetails for yourself"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if CollegeDetails.objects.filter(emp_id__emp_id=emp_id).exists():
            return Response({"error": "The College Details of this user already exists"}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        temp = get_object_or_404(Temp, emp_id=emp_id)
        
        serializer = CollegeDetailsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['emp_id'] = temp
            serializer.save()
            
            # Log activity
            log_activity(request.user, "Created", "CollegeDetails", serializer.data['id'],
                        f"Created CollegeDetails for emp_id {emp_id}", request)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, emp_id):  # Changed parameter to emp_id
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        try:
            college_details = CollegeDetails.objects.get(emp_id__emp_id=emp_id)  # Fetch by emp_id
        except CollegeDetails.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = CollegeDetailsSerializer(college_details, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            log_activity(request.user, "Updated", "CollegeDetails", college_details.id,
                         f"Updated CollegeDetails for emp_id {emp_id}", request)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, emp_id):  # Changed parameter to emp_id
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        try:
            college_details = CollegeDetails.objects.get(emp_id__emp_id=emp_id)  # Fetch by emp_id

            # Log activity before deleting
            log_activity(request.user, "Deleted", "CollegeDetails", college_details.id,
                         f"Deleted CollegeDetails for emp_id {emp_id}", request)

            college_details.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CollegeDetails.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# class FilesView(APIView):
#     def get(self, request, pk=None):
#         if pk:
#             try:
#                 files = Files.objects.get(pk=pk)
#                 serializer = FilesSerializer(files)
#                 return Response(serializer.data)
#             except Files.DoesNotExist:
#                 return Response(status=status.HTTP_404_NOT_FOUND)
#         else:
#             files = Files.objects.all()
#             serializer = FilesSerializer(files, many=True)
#             return Response(serializer.data)

#     def post(self, request):
#         serializer = FilesSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()

#             # Log activity
#             log_activity(request.user, "Created", "Files", serializer.data['id'],
#                          f"Created Files record", request)

#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def put(self, request, pk):
#         try:
#             files = Files.objects.get(pk=pk)
#         except Files.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

#         serializer = FilesSerializer(files, data=request.data)
#         if serializer.is_valid():
#             serializer.save()

#             # Log activity
#             log_activity(request.user, "Updated", "Files", files.id,
#                          f"Updated Files record", request)

#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         try:
#             files = Files.objects.get(pk=pk)

#             # Log activity before deleting
#             log_activity(request.user, "Deleted", "Files", files.id,
#                          f"Deleted Files record", request)

#             files.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except Files.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)


class AssertStockView(APIView):
    def get(self, request, pk=None):
        
        user = Temp.objects.get(user=request.user)
        if user.role == "intern":
            return Response("intern has no access to this")
        if pk:
            try:
                assert_stock = AssertStock.objects.get(assert_id=pk)
                serializer = AssertStockSerializer(assert_stock)
                return Response(serializer.data)
            except AssertStock.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            assert_stock = AssertStock.objects.all()
            serializer = AssertStockSerializer(assert_stock, many=True)
            return Response(serializer.data)

    def post(self, request):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" or user.role=="staff":
            return Response("Intern and staff has no access to this")
        
        emp_id = request.data.get('emp_id')
        serializer = AssertStockSerializer(data=request.data)

        if serializer.is_valid():
            assert_id = request.data.get('assert_id')  # Get assert_id for checks

            # Check if assert is in AssertIssue table
            if AssertIssue.objects.filter(assert_id=assert_id, condition='Not Usable').exists():
                return Response({"error": "Assert already in repair state"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if an emp_id is being assigned and if the assert is already assigned
            if emp_id and AssertStock.objects.filter(emp_id__isnull=False, assert_id=assert_id).exists():
                return Response(
                    {"error": "Assert already assigned to an employee. Unassign before assigning to another."},
                    status=status.HTTP_400_BAD_REQUEST)

            assert_stock = serializer.save()

            if emp_id:
                temp = get_object_or_404(Temp, emp_id=emp_id)
                old_assert = AssertStock.objects.filter(emp_id=temp).first()
                if old_assert:
                    old_assert.emp_id = None
                    old_assert.inhand = True
                    old_assert.save()
                assert_stock.emp_id = temp
                assert_stock.user = temp.user
                assert_stock.inhand = False
                assert_stock.save()
                assert_stock.update_assignment_history(emp_id)
                user_data, created = UserData.objects.get_or_create(emp_id=temp)
                user_data.asset_code = assert_stock
                user_data.save()
            else:
                assert_stock.inhand = True
                assert_stock.save()

            # Log activity
            log_activity(request.user, "Created", "AssertStock", assert_stock.assert_id,
                         f"Created AssertStock record", request)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern":
            return Response("Intern or staff has no access to this")
        
        try:
            assert_stock = AssertStock.objects.get(assert_id=pk)
        except AssertStock.DoesNotExist:
            return Response({"error": "Assert stock not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssertStockSerializer(assert_stock, data=request.data, partial=True)

        if serializer.is_valid():
            new_emp_id = request.data.get('emp_id')

            # Check if assert is in AssertIssue table
            if AssertIssue.objects.filter(assert_id=pk, condition='Not Usable').exists():
                return Response({"error": "Assert already in repair state"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if an emp_id is being assigned and if the assert is already assigned
            if new_emp_id and assert_stock.emp_id and str(assert_stock.emp_id.emp_id) != str(new_emp_id):  # Handle potential type issues
                return Response(
                    {"error": "Assert already assigned to an employee. Unassign before assigning to another."},
                    status=status.HTTP_400_BAD_REQUEST)

            updated_assert_stock = serializer.save()

            if new_emp_id:
                temp = get_object_or_404(Temp, emp_id=new_emp_id)
                updated_assert_stock.emp_id = temp
                updated_assert_stock.user = temp.user
                updated_assert_stock.inhand = False
                updated_assert_stock.save()
                updated_assert_stock.update_assignment_history(new_emp_id)
                user_data, created = UserData.objects.get_or_create(emp_id=temp)
                user_data.asset_code = updated_assert_stock
                user_data.save()
            else:
                updated_assert_stock.emp_id = None
                updated_assert_stock.user = None
                updated_assert_stock.inhand = True
                updated_assert_stock.save()

            # Log activity
            log_activity(request.user, "Updated", "AssertStock", pk,
                         f"Updated AssertStock record", request)

            return Response(AssertStockSerializer(updated_assert_stock).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" or user.role=='staff':
            return Response("Intern or staff has no access to this")
        
        try:
            assert_stock = AssertStock.objects.get(assert_id=pk)

            # Log activity before deleting
            log_activity(request.user, "Deleted", "AssertStock", pk,
                         f"Deleted AssertStock record", request)

            if assert_stock.emp_id:
                UserData.objects.filter(emp_id=assert_stock.emp_id, asset_code=assert_stock).update(asset_code=None)
            assignment_history = assert_stock.assignment_history
            assert_stock.delete()

            return Response({
                "message": f"Assert stock with ID {pk} deleted successfully.",
                "assignment_history": assignment_history
            }, status=status.HTTP_204_NO_CONTENT)
        except AssertStock.DoesNotExist:
            return Response({"error": f"Assert stock with ID {pk} not found"},
                            status=status.HTTP_404_NOT_FOUND)


class AssertIssueView(APIView):
    def get(self, request, assert_id=None):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern":
            return Response("intern has no access to this")
        if assert_id:
            try:
                assert_issue = AssertIssue.objects.get(assert_id__assert_id=assert_id)
                serializer = AssertIssueSerializer(assert_issue)
                return Response(serializer.data)
            except AssertIssue.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            assert_issues = AssertIssue.objects.all()
            serializer = AssertIssueSerializer(assert_issues, many=True)
            return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern  has no access to this")
        
        serializer = AssertIssueSerializer(data=request.data)

        if serializer.is_valid():
            assert_id = serializer.validated_data.get('assert_id')
            issue_condition = serializer.validated_data.get('condition')
            alternate_laptop = request.data.get('alternate_laptop')

            try:
                original_assert = assert_id

                if AssertIssue.objects.filter(assert_id=original_assert).exists():
                    return Response({"error": "An AssertIssue already exists for this assert_id"},
                                    status=status.HTTP_400_BAD_REQUEST)

                if issue_condition == 'Not Usable':
                    if alternate_laptop:
                        try:
                            alt_assert = AssertStock.objects.get(assert_id=alternate_laptop)
                            if alt_assert.emp_id:
                                return Response({"error": "Alternate laptop is already assigned to an employee"},
                                                status=status.HTTP_400_BAD_REQUEST)

                            alt_assert_issue = AssertIssue.objects.filter(
                                assert_id=alt_assert.assert_id).filter(condition='Not Usable')
                            if alt_assert_issue:
                                return Response({"error": "Alternate laptop is already under repair"},
                                                status=status.HTTP_400_BAD_REQUEST)

                            original_assert_data = AssertStock.objects.get(assert_id=original_assert.assert_id)
                            alt_assert_data = AssertStock.objects.get(assert_id=alt_assert.assert_id)

                            # Assign the original emp_id and user to the alternate laptop
                            alt_assert_data.emp_id = original_assert_data.emp_id
                            alt_assert_data.user = original_assert_data.user
                            alt_assert_data.inhand = False
                            alt_assert_data.save()

                            # Remove the emp_id and user from the original laptop
                            original_assert_data.emp_id = None
                            original_assert_data.user = None
                            original_assert_data.inhand = True
                            original_assert_data.save()

                            alt_assert_data.update_assignment_history(original_assert_data.emp_id.emp_id if original_assert_data.emp_id else None)
                            original_assert_data.update_assignment_history(None)

                        except AssertStock.DoesNotExist:
                            return Response({"error": "Alternate laptop not found in AssertStock"},
                                            status=status.HTTP_404_NOT_FOUND)

                    issue = serializer.save()
                    issue.condition = 'Not Usable'
                    issue.save()
                    logger.info(
                        f"Assert {assert_id.assert_id} marked as unusable, alternate {alternate_laptop if alternate_laptop else 'None'} assigned.")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    serializer.save()
                    logger.info(f"Assert {assert_id.assert_id} created with condition Usable")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

            except AssertStock.DoesNotExist as e:
                logger.error(f"AssertStock not found: {e}")
                return Response({"error": "Alternate laptop not found in AssertStock"},
                                status=status.HTTP_404_NOT_FOUND)
            except IntegrityError as e:
                logger.exception(f"IntegrityError during serializer.save(): {e}")
                return Response({"error": "Database integrity error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                logger.exception(f"An error occurred: {e}")
                return Response({"error": "An unexpected error occurred"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Log activity
            log_activity(request.user, "Created", "AssertIssue", serializer.data['id'],
                         f"Created AssertIssue record", request)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def put(self, request, assert_id):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        
        try:
            assert_issue = AssertIssue.objects.get(assert_id__assert_id=assert_id)
        except AssertIssue.DoesNotExist:
            return Response({"error": "AssertIssue not found"}, status=status.HTTP_404_NOT_FOUND)

        alternate_laptop = request.data.get('alternate_laptop') if request.data.get(
            'alternate_laptop') else assert_issue.alternate_laptop
        condition = request.data.get('condition') if request.data.get('condition') else assert_issue.condition

        if condition == 'Not Usable' and alternate_laptop:
            try:
                alt_assert = AssertStock.objects.get(assert_id=alternate_laptop)
                if alt_assert.emp_id:
                    return Response({"error": "Alternate laptop is already assigned to an employee"},
                                    status=status.HTTP_400_BAD_REQUEST)

                alt_assert_issue = AssertIssue.objects.filter(
                    assert_id=alt_assert.assert_id).filter(condition='Not Usable')
                if alt_assert_issue:
                    return Response({"error": "Alternate laptop is already under repair"},
                                    status=status.HTTP_400_BAD_REQUEST)

                original_assert = assert_issue.assert_id
                original_assert_data = AssertStock.objects.get(assert_id=original_assert.assert_id)
                alt_assert_data = AssertStock.objects.get(assert_id=alt_assert.assert_id)

                # Assign the original emp_id and user to the alternate laptop
                alt_assert_data.emp_id = original_assert_data.emp_id
                alt_assert_data.user = original_assert_data.user
                alt_assert_data.inhand = False
                alt_assert_data.save()

                # Remove the emp_id and user from the original laptop
                original_assert_data.emp_id = None
                original_assert_data.user = None
                original_assert_data.inhand = True
                original_assert_data.save()

                alt_assert_data.update_assignment_history(original_assert_data.emp_id)
                original_assert_data.update_assignment_history(None)

            except AssertStock.DoesNotExist:
                return Response({"error": "Alternate laptop not found in AssertStock"},
                                status=status.HTTP_404_NOT_FOUND)

        serializer = AssertIssueSerializer(assert_issue, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            log_activity(request.user, "Updated", "AssertIssue", assert_issue.id,
                         f"Updated AssertIssue record", request)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, assert_id):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        
        try:
            assert_issue = AssertIssue.objects.get(assert_id__assert_id=assert_id)

            # Log activity before deleting
            log_activity(request.user, "Deleted", "AssertIssue", assert_issue.id,
                         f"Deleted AssertIssue record", request)

            assert_issue.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except AssertIssue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)



class FeesView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Ensure user is logged in
    
    def get(self, request, emp_id=None):
        try:
            user_temp = Temp.objects.get(user=request.user)
        except Temp.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Function to calculate fee summaries for a user
        def get_fee_summary(temp_obj):
            user_obj = temp_obj.user
            fee_summaries = []
            
            # Get distinct domain/scheme combinations this user has paid for
            user_fees = Fees.objects.filter(user=user_obj)
            if not user_fees.exists():
                return []
            
            # Group by domain and fee_structure
            domain_structure_pairs = user_fees.values('domain', 'fee_structure').distinct()
            
            for pair in domain_structure_pairs:
                domain = Domain.objects.get(domain=pair['domain'])  # Changed from pk to domain
                fee_structure = FeeStructure.objects.get(pk=pair['fee_structure'])
                # Rest of the code remains unchanged
                total_price = fee_structure.price
                        
                        # Calculate total paid for this domain/scheme
                paid_fees = user_fees.filter(
                    domain=domain,
                    fee_structure=fee_structure
                )
                
                paid_amount = paid_fees.aggregate(total_paid=models.Sum('amount'))['total_paid'] or 0
                remaining_amount = total_price - paid_amount
                
                fee_summaries.append({
                    'domain': domain.domain,
                    'scheme': fee_structure.get_scheme_display(),
                    'total_amount': float(total_price),
                    'paid_amount': float(paid_amount),
                    'remaining_amount': float(remaining_amount),
                    'payment_history': FeesSerializer(paid_fees, many=True).data
                })
            
            return fee_summaries
        
        # Intern: Only own fees
        if user_temp.role.lower() == "intern":
            fee_summaries = get_fee_summary(user_temp)
            return Response({
                'emp_id': user_temp.emp_id,
                'username': user_temp.user.username,
                'fee_summaries': fee_summaries
            })
        
        # Specific employee lookup
        if emp_id:
            try:
                temp = Temp.objects.get(emp_id=emp_id)
                # Check permission for staff users
                if user_temp.role.lower() == 'staff':
                    # Check if the requested user reports to the requesting user
                    if not UserData.objects.filter(emp_id=temp, reporting_manager=request.user).exists():
                        return Response({"error": "You don't have permission to access this employee's data."},
                                      status=status.HTTP_403_FORBIDDEN)
                
                fee_summaries = get_fee_summary(temp)
                return Response({
                    'emp_id': temp.emp_id,
                    'username': temp.user.username,
                    'fee_summaries': fee_summaries
                })
            except Temp.DoesNotExist:
                return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # All employees based on role
        else:
            all_summaries = []
            if user_temp.role.lower() == 'admin':
                # Admins can see all users
                temps = Temp.objects.all()
            elif user_temp.role.lower() == 'staff':
                # Staff can only see users reporting to them
                temps = Temp.objects.filter(
                    user__in=User.objects.filter(userdata__reporting_manager=request.user)
                )
            else:
                # For other roles, return empty set
                temps = Temp.objects.none()
            
            for temp in temps:
                fee_summaries = get_fee_summary(temp)
                if fee_summaries:  # Only include users with fee data
                    all_summaries.append({
                        'emp_id': temp.emp_id,
                        'username': temp.user.username,
                        'fee_summaries': fee_summaries
                    })
            
            return Response(all_summaries)
    
    def post(self, request):
        try:
            # Get the current user's temp record
            user_temp = Temp.objects.get(user=request.user)
        except Temp.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Create a mutable copy of request data
        request_data = request.data.copy() if hasattr(request.data, 'copy') else QueryDict('', mutable=True)
        
        # For intern users, automatically fetch domain, scheme, and emp_id from their profile
        if user_temp.role.lower() == 'intern':
            try:
                # Get user data to extract domain and scheme
                user_data = UserData.objects.get(user=request.user)
                
                # Set emp_id, domain, and scheme from user profile
                request_data['emp_id'] = user_temp.emp_id
                request_data['domain'] = user_data.domain.domain  # Access domain name via relationship
                request_data['scheme'] = user_data.scheme
                request_data['user'] = request.user.id
                
                # Replace request data with our updated version
                request._full_data = request_data
            except UserData.DoesNotExist:
                return Response({"error": "User profile data not found."}, status=status.HTTP_404_NOT_FOUND)
        elif user_temp.role.lower() == 'staff':
            # Staff can pay for interns
            emp_id = request_data.get('emp_id')
            if not emp_id:
                return Response({"error": "Employee ID is required when staff pays for an intern."}, 
                            status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Get the intern's information
                intern_temp = Temp.objects.get(emp_id=emp_id)
                if not UserData.objects.filter(emp_id=intern_temp, reporting_manager=request.user).exists():
                        return Response({"error": "You don't have permission to access this employee's data."},
                      status=status.HTTP_403_FORBIDDEN)
                if intern_temp.role.lower() != 'intern':
                    return Response({"error": "The specified employee is not an intern."}, 
                                status=status.HTTP_400_BAD_REQUEST)
                    
                # Get intern's user data for domain and scheme
                intern_user_data = UserData.objects.get(emp_id=intern_temp)
                
                # Set domain and scheme from intern's profile
                request_data['domain'] = intern_user_data.domain.domain
                request_data['scheme'] = intern_user_data.scheme
                request_data['user'] = intern_temp.user.id
                
                # Replace request data with our updated version
                request._full_data = request_data
            except Temp.DoesNotExist:
                return Response({"error": "Intern not found with the provided Employee ID."}, 
                            status=status.HTTP_404_NOT_FOUND)
            except UserData.DoesNotExist:
                return Response({"error": "Intern profile data not found."}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        # Get domain and scheme from request
        domain_id = request_data.get('domain')
        scheme = request_data.get('scheme')
        
        # Find the fee structure based on domain and scheme
        try:
            fee_structure = FeeStructure.objects.get(domain=domain_id, scheme=scheme)
            request_data['fee_structure'] = str(fee_structure.id)
        except FeeStructure.DoesNotExist:
            return Response(
                {"error": f"No fee structure found for domain {domain_id} and scheme {scheme}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate payment amount
        amount = request_data.get('amount')
        if amount is not None:
            try:
                amount = float(amount)
                if amount <= 0:
                    return Response(
                        {"error": "Amount must be greater than zero."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {"error": "Amount must be a valid number."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Handle datetime field properly for the date to datetime conversion error
        # Remove paid_date from request data to use the model's default (timezone.now)
        if 'paid_date' in request_data:
            del request_data['paid_date']
        
        # Validate and prepare data using serializer
        serializer = FeesSerializer(data=request_data)
        if serializer.is_valid():
            domain = serializer.validated_data.get('domain')
            fee_structure = serializer.validated_data.get('fee_structure')
            user = serializer.validated_data.get('user')
            
            # Get total price for this domain and scheme
            total_price = fee_structure.price
            
            # Calculate already paid amount
            paid_amount = Fees.objects.filter(
                user=user,
                domain=domain,
                fee_structure=fee_structure
            ).aggregate(total_paid=models.Sum('amount'))['total_paid'] or 0
            
            # Calculate remaining amount
            remaining_amount = total_price - paid_amount
            
            # Get current payment amount
            current_amount = serializer.validated_data.get('amount')
            
            # Validate payment doesn't exceed remaining amount
            if current_amount > remaining_amount:
                return Response(
                    {"error": f"Cannot pay excess amount. Remaining amount is {remaining_amount}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # All validations passed, save the payment
            fee = serializer.save()
            
            # Log activity
            log_activity(request.user, "Created", "Fees", fee.id,
                        f"Created fee payment of {current_amount} for {user}", request)
            
            # Return response with payment summary
            response_data = serializer.data
            response_data.update({
                'total_price': float(total_price),
                'total_paid': float(paid_amount + current_amount),
                'remaining_amount': float(remaining_amount - current_amount)
            })
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            user_temp = Temp.objects.get(user=request.user)
            if user_temp.role.lower() != 'admin':
                return Response({"error": "Only admins can update fee records."},
                            status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            fee = Fees.objects.get(pk=pk)
        except Fees.DoesNotExist:
            return Response({"error": "Fee record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Validate amount is positive
        amount = request.data.get('amount')
        if amount is not None:
            try:
                amount = float(amount)
                if amount <= 0:
                    return Response(
                        {"error": "Amount must be greater than zero."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {"error": "Amount must be a valid number."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # If updating fee_structure or domain, recalculate total price
        fee_structure_id = request.data.get('fee_structure')
        domain_id = request.data.get('domain')
        
        try:
            # Get the current or new fee structure
            fee_structure = FeeStructure.objects.get(pk=fee_structure_id) if fee_structure_id else fee.fee_structure
        except FeeStructure.DoesNotExist:
            return Response(
                {"error": f"Fee structure with ID {fee_structure_id} not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the current or new domain
            domain = Domain.objects.get(domain=domain_id) if domain_id else fee.domain
        except Domain.DoesNotExist:
            return Response(
                {"error": f"Domain with ID {domain_id} not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate how much has been paid already (excluding this fee)
        paid_amount = Fees.objects.filter(
            user=fee.user,
            domain=domain,
            fee_structure=fee_structure
        ).exclude(id=fee.id).aggregate(total_paid=models.Sum('amount'))['total_paid'] or 0

        # Calculate remaining amount
        total_price = fee_structure.price
        remaining_amount = total_price - paid_amount

        # Check if new amount exceeds remaining amount
        new_amount = float(amount) if amount is not None else fee.amount
        if new_amount > remaining_amount:
            return Response(
                {"error": f"Cannot pay excess amount. Remaining amount is {remaining_amount}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = FeesSerializer(fee, data=request.data, partial=True)
        if serializer.is_valid():
            updated_fee = serializer.save()
            
            # Log activity
            log_activity(request.user, "Updated", "Fees", fee.id,
                        f"Updated Fees record", request)
            
            # Provide comprehensive response with payment summary
            response_data = serializer.data
            response_data.update({
                'total_price': float(total_price),
                'total_paid': float(paid_amount + new_amount),
                'remaining_amount': float(remaining_amount - new_amount)
            })
            
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def delete(self, request, pk):
        try:
            user_temp = Temp.objects.get(user=request.user)
            if user_temp.role.lower() != 'admin':
                return Response({"error": "Only admins can delete fee records."},
                            status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            fee = Fees.objects.get(pk=pk)
            # Log activity before deleting
            log_activity(request.user, "Deleted", "Fees", fee.id,
                    f"Deleted Fees record", request)
            fee.delete()
            return Response({"message": "Fee record successfully deleted."},
                        status=status.HTTP_204_NO_CONTENT)
        except Fees.DoesNotExist:
            return Response({"error": "Fee record not found."},
                        status=status.HTTP_404_NOT_FOUND)


class FeeStructureView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Ensure user is logged in
    
    def get(self, request, pk=None):
        # All authenticated users can access the GET method
        # No role checking needed for GET
        
        # Retrieve fee structure(s)
        if pk:
            try:
                fee_structure = FeeStructure.objects.get(pk=pk)
                serializer = FeeStructureSerializer(fee_structure)
                return Response(serializer.data)
            except FeeStructure.DoesNotExist:
                return Response({"error": "Fee structure not found."}, 
                               status=status.HTTP_404_NOT_FOUND)
        else:
            fee_structures = FeeStructure.objects.all()
            serializer = FeeStructureSerializer(fee_structures, many=True)
            return Response(serializer.data)
    
    def post(self, request):
    # Check if user is admin
        if (FeeStructure.objects.filter(domain=request.data.get("domain")).exists()) and (FeeStructure.objects.filter(domain=request.data.get("scheme")).exists()):
            return Response({"Entry already exists"})
        try:
            user = Temp.objects.get(user=request.user)
            if user.role.lower() != "admin":
                return Response({"error": "Only admins can create fee structures."}, 
                            status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                        status=status.HTTP_404_NOT_FOUND)
        
        # Check if domain is provided
        if 'domain' not in request.data or not request.data.get('domain'):
            return Response({"error": "Domain is required for fee structures."}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Set price to 0 if scheme is FREE
        data = request.data.copy()
        if data.get('scheme') == 'FREE':
            data['price'] = '0.00'
        
        # Create fee structure
        serializer = FeeStructureSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # Log activity
            log_activity(request.user, "Created", "FeeStructure", serializer.data['id'],
                        f"Created FeeStructure record", request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def put(self, request, pk):
    #     # Check if user is admin
    #     try:
    #         user = Temp.objects.get(user=request.user)
    #         if user.role.lower() != "admin":
    #             return Response({"error": "Only admins can update fee structures."}, 
    #                            status=status.HTTP_403_FORBIDDEN)
    #     except Temp.DoesNotExist:
    #         return Response({"error": "User role not found."}, 
    #                        status=status.HTTP_404_NOT_FOUND)
        
    #     # Update fee structure
    #     try:
    #         fee_structure = FeeStructure.objects.get(pk=pk)
    #     except FeeStructure.DoesNotExist:
    #         return Response({"error": "Fee structure not found."}, 
    #                        status=status.HTTP_404_NOT_FOUND)
        
    #     # Set price to 0 if scheme is FREE
    #     data = request.data.copy()
    #     if data.get('scheme') == 'FREE':
    #         data['price'] = '0.00'
        
    #     serializer = FeeStructureSerializer(fee_structure, data=data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         # Log activity
    #         log_activity(request.user, "Updated", "FeeStructure", fee_structure.id,
    #                     f"Updated FeeStructure record", request)
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        # Check if user is admin
        try:
            user = Temp.objects.get(user=request.user)
            if user.role.lower() != "admin":
                return Response({"error": "Only admins can update fee structures."}, 
                               status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Partially update fee structure
        try:
            fee_structure = FeeStructure.objects.get(pk=pk)
        except FeeStructure.DoesNotExist:
            return Response({"error": "Fee structure not found."}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Create a mutable copy of the request data
        data = request.data.copy()
        
        # Handling scheme changes
        if 'scheme' in data:
            if data['scheme'] == 'FREE':
                data['price'] = '0.00'
        # Handle cases where existing fee structure has scheme FREE but price is being updated
        elif fee_structure.scheme == 'FREE' and 'price' in data:
            data['price'] = '0.00'  # Force price to 0 if scheme is already FREE
        
        serializer = FeeStructureSerializer(fee_structure, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Log activity
            log_activity(request.user, "Updated", "FeeStructure", fee_structure.id,
                        f"Partially updated FeeStructure record", request)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        # Check if user is admin
        try:
            user = Temp.objects.get(user=request.user)
            if user.role.lower() != "admin":
                return Response({"error": "Only admins can delete fee structures."}, 
                               status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Delete fee structure
        try:
            fee_structure = FeeStructure.objects.get(pk=pk)
            # Log activity before deleting
            log_activity(request.user, "Deleted", "FeeStructure", fee_structure.id,
                        f"Deleted FeeStructure record", request)
            fee_structure.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except FeeStructure.DoesNotExist:
            return Response({"error": "Fee structure not found."}, 
                           status=status.HTTP_404_NOT_FOUND)





class AttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, emp_id=None):
        user = request.user
        try:
            user_temp = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        role = user_temp.role.lower()
        
        # Get date parameter if provided
        date_param = request.query_params.get('date')
        
        # Initialize response data structure
        response_data = []
        
        # Determine which employees to fetch records for
        if emp_id:
            # Single employee request
            try:
                target_temp = Temp.objects.get(emp_id=emp_id)
                # Permission checks
                if role == "intern" and user_temp.emp_id != target_temp.emp_id:
                    return Response(
                        {"error": "You can only view your own attendance records."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    
                if role == "staff":
                    is_assigned = UserData.objects.filter(
                        emp_id=target_temp,
                        reporting_manager=user
                    ).exists()
                    if not is_assigned:
                        return Response(
                            {"error": "This intern is not assigned to you."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                        
                employees = [target_temp]
            except Temp.DoesNotExist:
                return Response(
                    {"error": "Employee not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        else:
            # Multiple employees based on role
            if role == "intern":
                employees = [user_temp] # Interns only see themselves
            elif role == "staff":
                # Staff see all assigned interns
                assigned_interns = UserData.objects.filter(
                    reporting_manager=user
                )
                employees = [ud.emp_id for ud in assigned_interns if ud.emp_id]
            elif role in ["admin", "hr"]:
                # Admins and HR see all employees
                employees = Temp.objects.all()
            else:
                return Response(
                    {"error": "Invalid user role."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        # Process each employee
        for employee in employees:
            # Get attendance records for this employee
            attendance_query = Attendance.objects.filter(emp_id=employee)
            
            # If date parameter is provided, filter by date
            if date_param:
                try:
                    # Parse the date string into a date object
                    from datetime import datetime
                    parsed_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                    attendance_query = attendance_query.filter(date=parsed_date)
                except ValueError:
                    return Response(
                        {"error": "Invalid date format. Use YYYY-MM-DD format."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            attendance_records = attendance_query
            
            # Calculate summary metrics
            present_days = attendance_records.filter(present_status='Present').count()
            absent_days = attendance_records.filter(present_status='Absent').count()
            total_days = attendance_records.count()
            
            # Get pending leave requests
            pending_leave_requests = attendance_records.filter(
                leave_request=True,
                status='Pending'
            ).count()
            
            # Get the most recent record for leave counts
            latest_record = attendance_records.order_by('-date').first()
            
            # Default values
            remaining_leave = 5
            extra_leave = 0
            
            # Update with actual values if available
            if latest_record:
                remaining_leave = latest_record.remaining_leave_count if latest_record.remaining_leave_count is not None else 5
                extra_leave = latest_record.extra_leave_count if latest_record.extra_leave_count is not None else 0
                
            # Create employee data structure
            employee_data = {
                "emp_id": employee.emp_id,
                "name": employee.user.username,
                "summary": {
                    "total_days": total_days,
                    "present_days": present_days,
                    "absent_days": absent_days,
                    "remaining_leave": remaining_leave,
                    "extra_leave": extra_leave,
                    "pending_leave_requests": pending_leave_requests
                },
                "records": AttendanceSerializer(attendance_records, many=True).data
            }
            
            response_data.append(employee_data)
            
        # If it was a single employee request, return just that employee's data
        if emp_id:
            return Response(response_data[0] if response_data else {}, status=status.HTTP_200_OK)
            
        return Response(response_data, status=status.HTTP_200_OK)

    

    def post(self, request):
        user = request.user
        def get_client_ip(request):
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            return ip
        
        try:
            user_temp = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

       
        # Handle permissions and set emp_id based on role
        if user_temp.role.lower() == 'intern':
            # Interns can only enter their own attendance
            emp_id = user_temp.emp_id
            if 'emp_id' in request.data and str(request.data['emp_id']) != str(emp_id):
                return Response(
                    {"error": "You can only enter attendance for yourself."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Update request data with intern's info
            request.data['emp_id'] = emp_id
            request.data['name'] = user.username
        elif user_temp.role.lower() == 'staff':
            # Staff can enter attendance for assigned interns
            emp_id = request.data.get('emp_id')
            if not emp_id:
                return Response(
                    {"error": "Employee ID is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Check if the intern is assigned to this staff
            reporting_interns = UserData.objects.filter(
                reporting_manager=user
            ) | UserData.objects.filter(
                reporting_supervisor=user
            )
            if not reporting_interns.filter(emp_id__emp_id=emp_id).exists():
                return Response(
                    {"error": "You do not have permission to create attendance for this employee."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Get the employee's name
            try:
                temp = Temp.objects.get(emp_id=emp_id)
                request.data['name'] = temp.user.username
            except Temp.DoesNotExist:
                return Response(
                    {"error": "Employee not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif user_temp.role.lower() == 'admin':
            # Admins can enter attendance for anyone
            emp_id = request.data.get('emp_id')
            if not emp_id:
                return Response(
                    {"error": "Employee ID is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Get the employee's name
            try:
                temp = Temp.objects.get(emp_id=emp_id)
                request.data['name'] = temp.user.username
            except Temp.DoesNotExist:
                return Response(
                    {"error": "Employee not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"error": "You do not have permission to create attendance records."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Set the date for today if not provided
        date = request.data.get('date', timezone.now().date())
        request.data['date'] = date
        
        # Check if there's an open attendance entry for this employee on this date
        try:
            temp_obj = Temp.objects.get(emp_id=emp_id)
            
            # Get any existing attendance record for this date
            attendance = Attendance.objects.filter(
                emp_id=temp_obj,
                date=date
            ).first()
            
            # Check for any open logs (no checkout time)
            open_log = None
            if attendance:
                open_log = AttendanceLog.objects.filter(
                    attendance=attendance,
                    check_out__isnull=True
                ).first()
                
        except Temp.DoesNotExist:
            return Response(
                {"error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        current_time = timezone.now()
        
        # If there's an open log, don't allow creating a new entry
        if open_log:
            return Response(
                {"error": "There is already an open attendance entry for this employee on this date. Please close it before creating a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If there's no existing attendance for today, create one
        if not attendance:
            # Get the employee's current remaining leave count
            latest_attendance = Attendance.objects.filter(
                emp_id=temp_obj
            ).order_by('-date').first()
            remaining_leave = latest_attendance.remaining_leave_count if latest_attendance else 5

            # Handle leave request and leave counting
            is_leave_request = request.data.get('leave_request', False)
            present_status = request.data.get('present_status', 'Present')
            
            if is_leave_request or present_status == 'Absent':
                request.data['present_status'] = 'Absent'
                if remaining_leave > 0:
                    # If there are remaining leaves, decrement by 1
                    request.data['remaining_leave_count'] = remaining_leave - 1
                else:
                    # No need to modify remaining_leave_count (it's already 0)
                    request.data['remaining_leave_count'] = 0
                    
                # Count how many extra leaves this employee has taken
                extra_leaves_taken = Attendance.objects.filter(
                    emp_id=temp_obj,
                    present_status='Absent',
                    remaining_leave_count=0
                ).count()
                
                # Add 1 to extra leave count
                extra_leave_count = extra_leaves_taken + 1
                
                # Add a note about this being an extra leave
                extra_leave_note = f"Extra leave #{extra_leave_count}. "
                request.data['request'] = extra_leave_note + request.data.get('request', '')
            else:
                # Not a leave, carry forward the remaining leave count
                request.data['remaining_leave_count'] = remaining_leave

            # Create the attendance record
            serializer = AttendanceSerializer(data=request.data)
            if serializer.is_valid():
                attendance = serializer.save()
                
                # Now create an attendance log entry
                log_data = {
                    'attendance': attendance.id,
                    'emp_id': temp_obj.emp_id,
                    'check_in': current_time,
                    'ip_address': get_client_ip(request)
                }
                
                log_serializer = AttendanceLogSerializer(data=log_data)
                if log_serializer.is_valid():
                    log_entry = log_serializer.save()
                    
                    # Log the activities
                    log_activity(
                        user,
                        "Created",
                        "Attendance",
                        attendance.id,
                        f"Created attendance record for {attendance.name} on {attendance.date}",
                        request
                    )
                    
                    log_activity(
                        user,
                        "Created",
                        "AttendanceLog",
                        log_entry.id,
                        f"Created first login for {attendance.name} on {attendance.date}",
                        request
                    )
                    
                    # Return data
                    response_data = {
                        "attendance": serializer.data,
                        "log": log_serializer.data,
                        "message": "First attendance entry created successfully."
                    }
                    return Response(response_data, status=status.HTTP_201_CREATED)
                else:
                    # If log creation fails, delete the attendance and return error
                    attendance.delete()
                    return Response(log_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Attendance already exists for today, just create a new log entry
            log_data = {
                'attendance': attendance.id,
                'emp_id': temp_obj.emp_id,
                'check_in': current_time,
                'ip_address': get_client_ip(request)
            }
            
            log_serializer = AttendanceLogSerializer(data=log_data)
            if log_serializer.is_valid():
                log_entry = log_serializer.save()
                
                # Log the activity
                log_activity(
                    user,
                    "Created",
                    "AttendanceLog",
                    log_entry.id,
                    f"Created subsequent login for {attendance.name} on {attendance.date}",
                    request
                )
                
                response_data = {
                    "log": log_serializer.data,
                    "message": "Subsequent attendance log entry created successfully."
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            return Response(log_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def patch(self, request, attendance_id=None):
        """
        Update attendance record to set check-out time and calculate total hours:
        - Now captures reason for check-out (break, lunch, end of shift, etc.)
        - Staff can only update for assigned interns
        - Admin can update any attendance record
        """
        user = request.user
        try:
            user_temp = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        role = user_temp.role.lower()
        
        # Get the attendance record to update
        try:
            # If attendance_id is provided, use it to find the attendance record
            if attendance_id:
                attendance = Attendance.objects.get(id=attendance_id)
            else:
                # Otherwise, try to find today's attendance for the current user or specified emp_id
                emp_id = request.query_params.get('emp_id') or user_temp.emp_id
                date = request.query_params.get('date') or timezone.now().date()
                try:
                    temp_obj = Temp.objects.get(emp_id=emp_id)
                    attendance = Attendance.objects.get(emp_id=temp_obj, date=date)
                except Temp.DoesNotExist:
                    return Response(
                        {"error": "Employee not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "No attendance record found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if role == "intern":
            # Interns can only update their own attendance
            if str(attendance.emp_id.emp_id) != str(user_temp.emp_id):
                return Response(
                    {"error": "You can only update your own attendance."},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif role == "staff":
            # Staff can only update attendance for assigned interns
            is_assigned = UserData.objects.filter(
                emp_id=attendance.emp_id,
                reporting_manager=user
            ).exists()
            if not is_assigned:
                return Response(
                    {"error": "You can only update attendance for interns assigned to you."},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif role not in ["admin", "hr"]:
            # Unknown role
            return Response(
                {"error": "Invalid user role."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the most recent open log entry
        open_log = AttendanceLog.objects.filter(
            attendance=attendance,
            check_out__isnull=True
        ).order_by('-check_in').first()
        
        if not open_log:
            return Response(
                {"message": "This entry is over."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set the check-out time to the current time
        current_time = timezone.now()
        
        # Calculate total hours for this log entry
        if open_log.check_in:
            # Calculate the time difference for this log entry
            time_diff = current_time - open_log.check_in
            
            # Extract reason from request data
            reason = request.data.get('reason')
            
            # Update the log entry
            open_log.check_out = current_time
            open_log.total_hours = time_diff
            if reason:
                open_log.reason = reason
            open_log.save()
            
            # Now update the attendance record with accumulated hours
            all_logs = AttendanceLog.objects.filter(attendance=attendance)
            total_hours = timedelta()
            for log in all_logs:
                if log.total_hours:
                    total_hours += log.total_hours
            
            # Update the attendance record
            attendance.check_out = current_time # Last checkout time
            attendance.total_hours = total_hours
            attendance.save()
            
            # Log the activity
            log_activity(
                user,
                "Updated",
                "AttendanceLog",
                open_log.id,
                f"Updated attendance log with check-out time. Reason: {open_log.get_reason_display() if open_log.reason else 'Not specified'}. Total hours: {time_diff}",
                request
            )
            
            log_activity(
                user,
                "Updated",
                "Attendance",
                attendance.id,
                f"Updated attendance record with accumulated hours. Total hours: {total_hours}",
                request
            )
            
            # Serialize and return the updated records
            attendance_serializer = AttendanceSerializer(attendance)
            log_serializer = AttendanceLogSerializer(open_log)
            response_data = {
                "attendance": attendance_serializer.data,
                "log": log_serializer.data,
                "message": "Checkout completed successfully."
            }
            
            return Response(response_data)
        else:
            return Response(
                {"error": "Cannot update check-out time: No check-in time recorded in the log."},
                status=status.HTTP_400_BAD_REQUEST
            )


    def delete(self, request, attendance_id=None):
        """
        Delete an attendance record:
        - Admin can delete any attendance record
        - Staff can delete attendance records only for interns assigned to them
        """
        user = request.user
        try:
            user_temp = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        role = user_temp.role.lower()
        
        # Check if user has permission to delete attendance records
        if role not in ["admin", "staff"]:
            return Response(
                {"error": "Only admin and staff can delete attendance records."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the attendance record to delete
        try:
            # If attendance_id is provided in the URL, use it
            if attendance_id:
                attendance = Attendance.objects.get(id=attendance_id)
            else:
                # Otherwise, get it from request data
                emp_id = request.query_params.get('emp_id') or request.data.get('emp_id')
                date = request.query_params.get('date') or request.data.get('date')
                
                if not emp_id or not date:
                    return Response(
                        {"error": "Either attendance_id or both emp_id and date are required to delete an attendance record."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                attendance = Attendance.objects.get(emp_id=emp_id, date=date)
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Attendance record not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # For staff, check if the attendance record belongs to an intern assigned to them
        if role == "staff":
            # Check if the attendance record's emp_id is for an intern assigned to this staff
            is_assigned = UserData.objects.filter(
                emp_id=attendance.emp_id,
                reporting_manager=user
            ).exists()
            
            if not is_assigned:
                return Response(
                    {"error": "You can only delete attendance records for interns assigned to you."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Store information for logging before deletion
        attendance_id = attendance.id
        emp_id = attendance.emp_id.emp_id if attendance.emp_id else "Unknown"
        date = attendance.date
        
        # Delete the attendance record
        attendance.delete()
        
        # Log the activity
        log_activity(
            user,
            "Deleted",
            "Attendance",
            attendance_id,
            f"Deleted attendance record for employee {emp_id} on {date}",
            request
        )
        
        return Response(
            {"message": "Attendance record deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )




# views.py
class LogView(APIView):
    def get(self, request, emp_id=None):
        user = request.user
        try:
            user_data = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"message": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role = user_data.role.lower()
        
        # Interns cannot access logs
        if role == "intern":
            return Response(
                {"message": "Interns do not have access to logs."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # If emp_id is provided, validate access based on role
        if emp_id:
            try:
                target_temp = Temp.objects.get(emp_id=emp_id)
                
                # Staff can only access logs of interns assigned to them
                if role == "staff":
                    # Check if the intern is assigned to this staff
                    is_assigned = UserData.objects.filter(
                        emp_id=target_temp, 
                        reporting_manager=user
                    ).exists()
                    
                    if not is_assigned:
                        return Response(
                            {"message": "This intern is not assigned to you."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                
                # Get logs for the specified emp_id
                logs = Log.objects.filter(user_id=target_temp.user)
                
            except Temp.DoesNotExist:
                return Response(
                    {"message": "Employee ID not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # No emp_id provided, return logs based on role
            if role == "staff":
                # Staff can see logs of all assigned interns
                assigned_interns = UserData.objects.filter(reporting_manager=user).values_list('emp_id__user', flat=True)
                logs = Log.objects.filter(user_id__in=assigned_interns)
            elif role in ["admin", "hr"]:
                # Admin and HR can see all logs
                logs = Log.objects.all()
            else:
                # Unknown role
                return Response(
                    {"message": "Invalid user role."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)



class TaskView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access
    def get(self, request, pk=None):
        user = request.user  # Get logged-in user
        try:
            temp = Temp.objects.get(user=user)  # Get user's Temp model
        except Temp.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        # If a specific task ID is requested
        if pk:
            try:
                task = Task.objects.get(pk=pk)
                # Admin can see all tasks
                if temp.role == "admin":
                    serializer = TaskSerializer(task)
                    return Response(serializer.data)
                # Interns can only see their assigned tasks
                if task.assigned_to == user:
                    serializer = TaskSerializer(task)
                    return Response(serializer.data)
                # Reporting managers and supervisors can see tasks assigned to their interns
                if task.assigned_to in User.objects.filter(userdata__reporting_manager=user) or \
                        task.assigned_to in User.objects.filter(userdata__reporting_supervisor=user):
                    serializer = TaskSerializer(task)
                    return Response(serializer.data)
                return Response({"error": "You don't have permission to view this task."}, status=status.HTTP_403_FORBIDDEN)
            except Task.DoesNotExist:
                return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        # Fetch tasks based on role
        if temp.role == "admin":
            tasks = Task.objects.all()  # Admin sees all tasks
        elif temp.role == "intern":
            tasks = Task.objects.filter(assigned_to=user)  # Intern sees only their tasks
        elif temp.role in ["staff", "hr"]:
            # Reporting managers and supervisors see tasks assigned to interns under them
            tasks = Task.objects.filter(
                assigned_to__in=User.objects.filter(
                    userdata__reporting_manager=user
                ) | User.objects.filter(userdata__reporting_supervisor=user)
            )
        else:
            tasks = Task.objects.none()  # Default: No tasks
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            log_activity(request.user, "Created", "Task", serializer.data['id'],
                         f"Created Task record", request)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, pk=None):
        if pk is None:
            return Response({"error": "Task ID is required for updates"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Log activity
            log_activity(request.user, "Updated", "Task", task.id,
                         f"Updated Task record", request)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)

            # Log activity before deleting
            log_activity(request.user, "Deleted", "Task", task.id,
                         f"Deleted Task record", request)

            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# class LeaveRequestView(APIView):
# permission_classes = [IsAuthenticated] # Ensure user is logged in
# def post(self, request):
# """Intern applies for leave"""
# user = request.user
# temp = Temp.objects.filter(user=user).first()
# if not temp:
# return Response({"error": "User is not associated with an employee ID."}, status=status.HTTP_400_BAD_REQUEST)
# if temp.role.lower() != "intern":
# return Response({"error": "Only interns can apply for leave."}, status=status.HTTP_403_FORBIDDEN)
# # Auto-fetch emp_id based on logged-in user
# leave_request_data = {
# "name": user.username,
# "emp_id": temp.emp_id,
# "apply_date": timezone.now().date(),
# "number_of_days": request.data.get("number_of_days"),
# "from_date": request.data.get("from_date"),
# "to_date": request.data.get("to_date"),
# "request": request.data.get("request"),
# "leave_request": True # Mark as leave request
# }
# serializer = AttendanceSerializer(data=leave_request_data)
# if serializer.is_valid():
# serializer.save()
# return Response(serializer.data, status=status.HTTP_201_CREATED)
# return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# def patch(self, request, emp_id=None):
# """admin/staff approve or reject leave"""
# if emp_id:
# try:
# leave_request = Attendance.objects.filter(emp_id=emp_id, leave_request=True).latest('apply_date')
# except Attendance.DoesNotExist:
# return Response({"error": "No leave request found for this employee."}, status=status.HTTP_404_NOT_FOUND)
# user = request.user
# temp = Temp.objects.filter(user=user).first()
# if not temp:
# return Response({"error": "User is not associated with an employee ID."}, status=status.HTTP_400_BAD_REQUEST)
# # Only admin/staff can approve/reject leave requests
# if temp.role.lower() in ['admin', 'staff']:
# if "status" in request.data:
# leave_request.status = request.data.get("status")
# # If leave is approved and the employee is an intern, mark as Absent
# if leave_request.status == "Approved" and leave_request.emp_id.role.lower() == "intern":
# leave_request.status = "Absent"
# leave_request.save()
# serializer = AttendanceSerializer(leave_request)
# return Response(serializer.data, status=status.HTTP_200_OK)
# return Response({"error": "Only admin/staff can approve/reject leave requests."}, status=status.HTTP_403_FORBIDDEN)
# return Response({"error": "Employee ID is required for updates."}, status=status.HTTP_400_BAD_REQUEST)


class LeaveRequestView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in

    def post(self, request):
        """Intern applies for leave"""
        user = request.user
        temp = Temp.objects.filter(user=user).first()
        if not temp:
            return Response({"error": "User is not associated with an employee ID."}, status=status.HTTP_400_BAD_REQUEST)
        if temp.role.lower() != "intern":
            return Response({"error": "Only interns can apply for leave."}, status=status.HTTP_403_FORBIDDEN)

        # Auto-fetch emp_id based on logged-in user
        leave_request_data = {
            "name": user.username,
            "emp_id": temp.emp_id,
            "apply_date": timezone.now().date(),
            "number_of_days": request.data.get("number_of_days"),
            "from_date": request.data.get("from_date"),
            "to_date": request.data.get("to_date"),
            "request": request.data.get("request"),
            "status": "Pending",
            "leave_request": True  # Mark as leave request
        }

        serializer = AttendanceSerializer(data=leave_request_data)
        if serializer.is_valid():
            serializer.save()
            # Log activity
            log_activity(request.user, "Created", "Attendance", serializer.data['id'],
                         f"Created Leave Request for emp_id {temp.emp_id}", request)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, emp_id):
        """admin/staff approve or reject leave"""
        try:
            leave_request = Attendance.objects.filter(emp_id=emp_id, leave_request=True).latest('apply_date')
        except Attendance.DoesNotExist:
            return Response({"error": "No leave request found for this employee."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        temp = Temp.objects.filter(user=user).first()
        if not temp:
            return Response({"error": "User is not associated with an employee ID."}, status=status.HTTP_400_BAD_REQUEST)

        # Only admin/staff can approve/reject leave requests
        if temp.role.lower() in ['admin', 'staff']:
            if "status" in request.data:
                leave_request.status = request.data.get("status")

                # If leave is approved and employee is an intern, mark as Absent
                if leave_request.status == "Approved" and leave_request.emp_id.role.lower() == "intern":
                    leave_request.present_status = "Absent"
                elif leave_request.status == "Rejected":
                    leave_request.present_status = "Null"  # Reset status if leave is rejected

                leave_request.save()

                # Log activity
                log_activity(request.user, "Updated", "Attendance", leave_request.id,
                             f"Leave Request {leave_request.status} for emp_id {emp_id}", request)

                serializer = AttendanceSerializer(leave_request)
                return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"error": "Only admin/staff can approve/reject leave requests."}, status=status.HTTP_403_FORBIDDEN)


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")
        if not username_or_email or not password:
            return Response({"error": "Please provide both username/email and password."}, status=status.HTTP_400_BAD_REQUEST)
        # Check if the provided identifier is an email or a username
        user = None
        if '@' in username_or_email:  # Assuming it's an email
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        else:  # Assuming it's a username
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
        # Authenticate the user
        if user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "message": "Login successful"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can log out

    def post(self, request):
        try:
            # Log logout activity
            log_activity(request.user, "Logged Out", "User", request.user.id,
                         f"User logged out successfully", request)

            # Delete the user's token to log them out
            Token.objects.get(user=request.user).delete()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            return Response({"error": "User is not logged in."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users (admins) can create accounts

    def post(self, request):
        """
        Admins can create users with any role.
        Staff can create users with the role of 'intern' only.
        """
        # Get the requesting user's role
        try:
            temp = Temp.objects.get(user=request.user)
            user_role = temp.role.lower()
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has permission to create users
        if user_role not in ['admin', 'staff']:
            return Response({"error": "Only admins and staff can create new users."}, status=status.HTTP_403_FORBIDDEN)
        
        # Get requested role for new user (default to 'intern')
        requested_role = request.data.get("role", "intern").lower()
        
        # Staff can only create interns
        if user_role == 'staff' and requested_role != 'intern':
            return Response({"error": "Staff can only create users with the role of 'intern'."}, status=status.HTTP_403_FORBIDDEN)
        
        # Proceed with user creation
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        
        if not username or not password or not email:
            return Response({"error": "Username, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, password=password, email=email,
                                        first_name=first_name, last_name=last_name)
        
        UserProfile.objects.create(user=user) # Create user profile
        Temp.objects.create(user=user, role=requested_role) # Assign the role
        
        # Log activity
        log_activity(request.user, "Created", "User", user.id,
                    f"Created new user {username} with role {requested_role}", request)
        
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)



    def put(self, request):
            serializer = UpdatePasswordSerializer(data=request.data)
            
            if serializer.is_valid():
                user = request.user
                new_password = serializer.validated_data["new_password"]
                
                # Update password
                user.set_password(new_password)
                user.save()
                
                return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def get(self, request):
        user = request.user
        try:
            temp = Temp.objects.get(user=user)
            
            if temp.role == 'admin':
                # admins can see all users
                users = User.objects.all()
                
            elif temp.role == 'staff' or temp.role == 'Staff':
               
                # staff can only see users reporting to them
                users = User.objects.filter(userdata__reporting_manager=user)
                
            else:
                # For other roles, return empty or restricted set
                users = User.objects.none()
                
            serializer = UserSerialize(users, many=True)
            return Response(serializer.data)
            
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, status=status.HTTP_404_NOT_FOUND)
    


class DashboardView(APIView):
    def get(self, request):
        # Total Users Count
        total_users = Temp.objects.count()

        # Users Count by Month
        users_by_month = (
            UserData.objects.annotate(month=ExtractMonth("created_date"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        # Users Count by Year
        users_by_year = (
            UserData.objects.annotate(year=ExtractYear("created_date"))
            .values("year")
            .annotate(count=Count("id"))
            .order_by("year")
        )

        # Users Count by Role (Using Temp table)
        users_by_role = (
            Temp.objects.values("role")
            .annotate(count=Count("emp_id"))
            .order_by("role")
        )

        # Users Count by User Status
        users_by_status = (
            UserData.objects.values("user_status")
            .annotate(count=Count("id"))
            .order_by("user_status")
        )

        # Users Count by Domain
        users_by_domain = (
            UserData.objects.values("domain")
            .annotate(count=Count("id"))
            .order_by("domain")
        )

        return Response(
            {
                "total_users": total_users,
                "users_by_month": list(users_by_month),
                "users_by_year": list(users_by_year),
                "users_by_role": list(users_by_role),
                "users_by_status": list(users_by_status),
                "users_by_domain": list(users_by_domain),
            },
            status=status.HTTP_200_OK)














#-----------------------------------changes--------------------------------#

class Document_Type(APIView):
    def post(self, request):
        document_type_data = request.data.get('type')
        if not document_type_data:
            return Response({"message": "Document type is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        print(f"User: {user}")

        try:
            user_data = Temp.objects.get(user=request.user)
           
        except Temp.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error: {e}")
            return Response({"message": "An error occurred while retrieving user data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        allowed_roles = ["staff", "admin"]


        # Debugging line to see the user role
        if user_data.role not in allowed_roles:
            return Response({"message": "You do not have permission to create document types."}, status=status.HTTP_403_FORBIDDEN)

        if DocumentType.objects.filter(name=document_type_data, emp_id=user_data.emp_id).exists():
            return Response({"message": f"A document with the type '{document_type_data}' already exists for this organization."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the new document type
        new_document = DocumentType.objects.create(
            name=document_type_data,
            emp_id=user_data.emp_id
        )

        # Log the activity
        log_activity(
            user=user_data,
            action="Created Document Type",
            entity_type="DocumentType",
            entity_id=new_document.id,
            description=f"User {user.username} created a new document type '{new_document.name}' for Emp_id '{user_data.emp_id}'.",
            ip_address=request.META.get('REMOTE_ADDR', 'Unknown')
        )

        return Response({
            "message": "Document uploaded successfully.",
            "file_name": new_document.name,
            "Employee Id": user_data.emp_id
        }, status=status.HTTP_201_CREATED)




class DocumentViewSet(APIView):
    def get(self, request, emp_id=None):
        user = request.user
        try:
            user_data = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"message": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role = user_data.role.lower()
        
        # If emp_id is provided, validate access based on role
        if emp_id:
            try:
                target_temp = Temp.objects.get(emp_id=emp_id)
                
                # Interns can only access their own documents
                if role == "intern" and user_data.emp_id != target_temp.emp_id:
                    return Response(
                        {"message": "You can only access your own documents."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Staff can only access documents of interns assigned to them
                if role == "staff":
                    # Check if the intern is assigned to this staff
                    is_assigned = UserData.objects.filter(
                        emp_id=target_temp, 
                        reporting_manager=user
                    ).exists()
                    
                    if not is_assigned:
                        return Response(
                            {"message": "This intern is not assigned to you."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                
                # Get documents for the specified emp_id
                documents = Document.objects.filter(emp_id=target_temp)
                
            except Temp.DoesNotExist:
                return Response(
                    {"message": "Employee ID not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # No emp_id provided, return documents based on role
            if role == "intern":
                # Interns can only see their own documents
                documents = Document.objects.filter(emp_id=user_data)
            elif role == "staff":
                # Staff can see documents of all assigned interns
                assigned_interns = UserData.objects.filter(reporting_manager=user).values_list('emp_id', flat=True)
                documents = Document.objects.filter(emp_id__in=assigned_interns)
            elif role in ["admin", "hr"]:
                # Admin and HR can see all documents
                documents = Document.objects.all()
            else:
                # Unknown role
                return Response(
                    {"message": "Invalid user role."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Retrieve approval history for rejected documents with comments
            approval_history = FileApprovalHistory.objects.filter(
                document__in=documents,
                approval_status="REJECTED"
            ).exclude(comments="")
            
            # Serialize data
            document_serializer = DocumentSerializer(documents, many=True)
            
            return Response(
                {
                    "documents": document_serializer.data,
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.exception("Error while retrieving documents.")
            return Response(
                {"message": "An error occurred while retrieving the documents."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def post(self, request):
        # Extract necessary data from the request
        declaration_number = request.data.get('declaration_Number')
        files = request.FILES
        
        if not declaration_number or not files:
            logger.error("Declaration number or files are missing.")
            return Response(
                {"message": "Declaration number and files are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the authenticated user and their role
        user = request.user
        try:
            user_data = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            logger.error(f"User data not found for user {user.username}.")
            return Response(
                {"message": "User data not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        role = user_data.role.lower()
        
        # Get the target emp_id (for whom the document is being uploaded)
        target_emp_id = request.data.get('emp_id', user_data.emp_id)
        
        # If different from current user, check permissions
        if str(target_emp_id) != str(user_data.emp_id):
            # Interns can only upload their own documents
            if role == "intern":
                logger.error(f"Intern trying to upload documents for another user.")
                return Response(
                    {"message": "As an intern, you can only upload your own documents."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Staff can only upload for assigned interns
            if role == "staff":
                try:
                    target_temp = Temp.objects.get(emp_id=target_emp_id)
                    is_assigned = UserData.objects.filter(
                        emp_id=target_temp, 
                        reporting_manager=user
                    ).exists()
                    
                    if not is_assigned:
                        return Response(
                            {"message": "This intern is not assigned to you."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                    
                    # Update user_data to target user for document creation
                    user_data = target_temp
                    
                except Temp.DoesNotExist:
                    return Response(
                        {"message": "Target employee ID not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        uploaded_files = []
        for file_key, file_value in files.items():
            document_type_name = file_key  # The key is the document type
            document_file = file_value

            if not document_type_name:
                logger.warning("Document type is missing for one of the files.")
                continue

            # Retrieve or create DocumentType
            try:
                
                document_type, _ = DocumentType.objects.get_or_create(
                    name=document_type_name,
                    emp_id=user_data,
                    defaults={"description": "Automatically created"}
                )
                
                logger.info(f"DocumentType '{document_type.name}' processed.")
            except Exception as e:
                logger.error(f"Error creating or retrieving DocumentType: {str(e)}")
                return Response(
                    {"message": "An error occurred while processing the document type."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create DocumentVersion
            try:
                
                latest_version = DocumentVersion.objects.filter(
                    document_type=document_type,
                    document__declaration_number=declaration_number
                ).order_by('-version_number').first()
                version_number = (latest_version.version_number + 1) if latest_version else 1
                
                document_version = DocumentVersion.objects.create(
                    file_path=document_file,
                    document_type=document_type,
                    version_number=version_number,
                    file_size=document_file.size,
                    uploaded_by=user_data.user,
                )
                
                logger.info(f"DocumentVersion {version_number} created.")
            except Exception as e:
                logger.error(f"Error creating DocumentVersion: {str(e)}")
                return Response(
                    {"message": "An error occurred while processing the document version."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Retrieve or create Document
            try:
    # Retrieve or create Document
                document_data = {
                    "title": request.data.get("title", ""),  # Default to an empty string
                    "description": request.data.get("description", ""),  # Default to an empty string
                    "priority": request.data.get("priority", "MEDIUM"),  # Default to MEDIUM
                    "status": request.data.get("status", "PENDING"),  # Default to PENDING
                    "workflow_status": request.data.get("workflow_status", "IN_PROGRESS"),  # Default to IN_PROGRESS
                    "uploader": user_data.user,
                    "emp_id":user_data,
                    "declaration_number": declaration_number,
                    "document_type": document_type,
                    "current_version": document_version,
                }
                
                document, created = Document.objects.get_or_create(
                    declaration_number=declaration_number,
                    document_type=document_type,
                    emp_id=user_data,
                    defaults=document_data,
                )
                
                if not created:
                    # Update the document with any new data if it's not created
                    for field, value in document_data.items():
                        setattr(document, field, value)
                    document.current_version = document_version
                    document.save()
                    logger.info(f"Document '{document.declaration_number}' updated with new version.")

                # Associate the document with the document version
                document_version.document = document
                document_version.save()
                
                uploaded_files.append({
                    "declaration_number": document.declaration_number,
                    "document_type": document_type.name,
                    "file_name": document_version.file_path.name,
                    "version_number": document_version.version_number,
                })


                log_activity(
                    user_data.user,  # Pass the actual User object
                    "Uploaded Document",
                    "Document",
                    document.id,
                    f"User {user.username} uploaded a document (Declaration No: {document.declaration_number}).",
                    request
                )

                    

            except Exception as e:
                logger.error(f"Error creating or updating Document: {str(e)}")
                return Response(
                    {"message": "An error occurred while processing the document."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


        if not uploaded_files:
            logger.error("No files were successfully uploaded.")
            return Response(
                {"message": "No files were successfully uploaded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info("Documents uploaded successfully.")
        return Response(
            {
                "message": "Documents uploaded successfully.",
                "uploaded_files": uploaded_files,
            },
            status=status.HTTP_201_CREATED
        )

    
    def delete(self, request, document_id=None):
        """
        Delete a document based on role-based permissions:
        - Interns can only delete their own documents
        - Staff can only delete documents of interns assigned to them
        - Admin and HR can delete any document
        """
        user = request.user
        try:
            user_data = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return Response(
                {"message": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role = user_data.role.lower()
        
        # Check if document_id is provided
        if not document_id:
            return Response(
                {"message": "Document ID is required for deletion."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find the document
        try:
            document = Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return Response(
                {"message": "Document not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Implement role-based permissions
        if role == "intern":
            return Response(
                {"message": "Intern cannot delete a document."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        elif role == "staff":
            # Staff can only delete documents of interns assigned to them
            if not UserData.objects.filter(
                emp_id=document.emp_id,
                reporting_manager=user
            ).exists():
                return Response(
                    {"message": "You can only delete documents of interns assigned to you."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        elif role not in ["admin", "hr"]:
            # Unknown role
            return Response(
                {"message": "Invalid user role."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # All permission checks passed, delete the document
        try:
            # Store document info before deletion
            declaration_number = document.declaration_number
            doc_id = document.id
            
            # Delete the document first
            document.delete()
            
            # Log activity after successful deletion
            try:
                # Use positional arguments to match function signature
                log_activity(
                    user_data.user,  # Pass the actual User object
                    "Uploaded Document",
                    "Document",
                    document.id,
                    f"User {user.username} uploaded a document (Declaration No: {document.declaration_number}).",
                    request
                )

            except Exception as log_error:
                # Continue even if logging fails
                logger.error(f"Error logging activity: {str(log_error)}")
            
            return Response(
                {"message": "Document deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return Response(
                {"message": "An error occurred while deleting the document."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class ApproveRejectDocument(APIView):

    def post(self, request, document_id):

        print(document_id, request.data)
        try:
            document = Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        user = Temp.objects.get(user=request.user)
        if user.role != "staff" or user.role !="admin":
            return Response({"error": "You don't have permission to approve/reject this document."}, 
                            status=status.HTTP_403_FORBIDDEN)

        approval_status = request.data.get("approval_status")
        comments = request.data.get("comments", "")
        print(comments)
        # description = request.data.get("description", "") 
        rework_reason_id = request.data.get("rework_reason_id", None)

        # Check if approval status is provided
        if approval_status not in ['Approved', 'Rejected', 'REWORK']:
            return Response({"error": "Invalid approval status"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle the approval/rejection or rework
        if approval_status == "Approved":
            status_data = 'APPROVED'
            document.status = 'APPROVED'
        elif approval_status == "Rejected":
            status_data = 'REJECTED'
            document.status = 'REJECTED'
        elif approval_status == "REWORK":
            status_data = 'REWORK'
            document.status = 'PENDING'
            document.workflow_status = 'UNDER_REWORK'

        # Save the document status update
        document.save()

        # Handle rework reason creation if comments are not provided
        rework_reason = None
        print('comments: ',comments)
        if comments:
            print(comments)
            rework_reason = ReworkReason.objects.create(description=comments, name = document.declaration_number)
        elif rework_reason_id:
            rework_reason = ReworkReason.objects.get(id=rework_reason_id)
        print('rework : ',rework_reason)
        # Log the approval/rejection history
        approval_history = FileApprovalHistory(
            document=document,
            approved_by=user,
            version=document.current_version,
            approval_status=status_data,
            comments= comments if comments else '',  # Use description if provided, otherwise comments
            approval_date=document.updated_at,  # Assuming updated_at is the approval timestamp
            rework_reason=rework_reason
        )
        approval_history.save()
        print()
        document.file_approval_history = approval_history
        document.save()
        authuser = User.objects.get(user=request.user)

        log_activity(
                user_data.user,  # Pass the actual User object
                "Uploaded Document",
                "Document",
                document.id,
                f"User {user.username} uploaded a document (Declaration No: {document.declaration_number}).",
                request
            )

        

        # Respond back with the updated document information
        return Response({
            "message": "Document successfully processed",
            "document": {
                "id": document.id,
                "status": document.status,
                "workflow_status": document.workflow_status,
                "description": comments if comments else ''  # Return the used field
            }
        }, status=status.HTTP_200_OK)





class DocumentList(APIView):
    def get(self, request):
        user = Temp.objects.get(user=request.user)
        if user.role == "intern" :
            return Response("Intern has no access to this")
        
        user = request.user
        
        # Check if the user is linked to the custom User model
        try:
            user_data = Temp.objects.get(user=user)

        except Temp.DoesNotExist:
            return Response(
                {"message": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        

        # Get all documents related to the user's organization
        documents = Document.objects.filter(emp_id=user_data.emp_id)

        document_versions = DocumentVersion.objects.filter(document__in=documents)

        serializer = DocumentVersionSerializer(document_versions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
  





class ResetPasswordOTPRequestView(APIView):
    permission_classes = [AllowAny]  # Allow public access
    
    def post(self, request):
        serializer = ResetPasswordOTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = User.objects.get(email=email)
                # Resend OTP (Invalidate old OTPs and create a new one)
                otp_entry = PasswordResetOTP.resend_otp(user)
                # Send OTP via email
                send_mail(
                    "Password Reset OTP",
                    f"Your OTP for password reset is: {otp_entry.otp}",
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            try:
                user = User.objects.filter(email=email).first()
                if not user:
                    return Response({"error": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)

                otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp).first()

                if otp_record.is_expired():
                    return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
                user = User.objects.get(email=email)
                # Generate or get existing token
                token, _ = Token.objects.get_or_create(user=user)
               
                otp_record.delete()
                return Response({'message': 'OTP is valid. Use the token to reset your password.', 'token': token.key}, status=status.HTTP_200_OK)
            except PasswordResetOTP.DoesNotExist:
                return Response({'error': 'Invalid OTP or email.'}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class DomainView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Ensure user is logged in
    
    def get(self, request, pk=None):
        # Check if user is admin
        try:
            user = Temp.objects.get(user=request.user)
            print(user.role)
            if user.role == 'intern':
                return Response({"error": "Only admins and staff can access domains."}, 
                               status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Retrieve domain(s)
        if pk:
            try:
                domain_obj = Domain.objects.get(pk=pk)
                serializer = DomainSerializer(domain_obj)
                return Response(serializer.data)
            except Domain.DoesNotExist:
                return Response({"error": "Domain not found."}, 
                               status=status.HTTP_404_NOT_FOUND)
        else:
            domains = Domain.objects.all()
            serializer = DomainSerializer(domains, many=True)
            return Response(serializer.data)
    
    def post(self, request):
        # Check if user is admin
        try:
            user = Temp.objects.get(user=request.user)
            if user.role.lower() != 'admin':
                return Response({"error": "Only admins can create domains."}, 
                               status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Create domain
        serializer = DomainSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Log activity
            log_activity(request.user, "Created", "Domain", serializer.data['domain'],
                        f"Created Domain record", request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk=None):
        # Authorization checks remain the same
        try:
            user = Temp.objects.get(user=request.user)
            if user.role.lower() != 'admin':
                return Response({"error": "Only admins can update domains."}, 
                            status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                        status=status.HTTP_404_NOT_FOUND)
        
        # Check if domain is provided
        if pk is None:
            return Response({"error": "Domain is required for updates."}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Get existing domain object
        try:
            domain_obj = Domain.objects.get(pk=pk)
        except Domain.DoesNotExist:
            return Response({"error": "Domain not found."}, 
                        status=status.HTTP_404_NOT_FOUND)
        
        # Update domain using serializer (which now just updates the instance)
        serializer = DomainSerializer(domain_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Log activity
            log_activity(request.user, "Updated", "Domain", domain_obj.id,
                        f"Updated Domain record", request)
            
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


 
    def delete(self, request, domain=None):
        # Check if user is admin
        try:
            user = Temp.objects.get(user=request.user)
            if user.role.lower() != 'admin':
                return Response({"error": "Only admins can delete domains."}, 
                               status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User role not found."}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Check if domain is provided
        if domain is None:
            return Response({"error": "Domain is required for deletion."}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Delete domain
        try:
            domain_obj = Domain.objects.get(domain=domain)
            # Log activity before deleting
            log_activity(request.user, "Deleted", "Domain", domain,
                        f"Deleted Domain record", request)
            domain_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Domain.DoesNotExist:
            return Response({"error": f"Domain with name {domain} not found."}, 
                           status=status.HTTP_404_NOT_FOUND)




class PerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Automatically update tasks to 'Missing' if they are not completed within the committed date
        today = timezone.now().date()
        tasks_to_update = Task.objects.filter(
            Q(status__in=['Under_Review', 'In_Progress', 'Not_Started']) & Q(committed_date__lt=today)
        )
        tasks_to_update.update(status='Missing')

        # Fetch tasks after updating their statuses
        tasks = Task.objects.all()
        task_status_count = tasks.values('status').annotate(count=Count('status'))

        completed_tasks = tasks.filter(status='Completed')
        completed_tasks_data = [
            {
                'task_id': task.id,
                'start_date': task.start_date,
                'end_date': task.end_date
            }
            for task in completed_tasks
        ]

        response_data = {
            'total_tasks': tasks.count(),
            'status_counts': {item['status']: item['count'] for item in task_status_count},
            'completed_tasks': completed_tasks_data
        }

        return Response(response_data)








class MonthlyTaskCountView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Get logged-in intern
        try:
            temp_user = Temp.objects.get(user=request.user)
            if temp_user.role.lower() != "intern":
                return Response({"error": "Only interns can access their task count."}, status=status.HTTP_403_FORBIDDEN)
        except Temp.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        # Get the current year
        current_year = now().year
        # Get completed tasks for this intern, grouped by month
        task_counts = (
            Task.objects.filter(assigned_to=request.user, status="Completed", end_date__year=current_year)
            .annotate(month=ExtractMonth("end_date"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        # Convert month numbers to names
        month_names = {
            1: "January", 2: "February", 3: "March", 4: "April",
            5: "May", 6: "June", 7: "July", 8: "August",
            9: "September", 10: "October", 11: "November", 12: "December"
        }
        monthly_task_data = {month_names[t["month"]]: t["count"] for t in task_counts}
        return Response({"intern": request.user.username, "task_counts": monthly_task_data}, status=status.HTTP_200_OK)