#!/usr/bin/env python
"""
Database check script for intern registration issues
Run this script to check the database state after registration
"""

import os
import sys
import django

# Setup Django environment
sys.path.append('/path/to/your/project')  # Update this path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from Sims.models import User, Temp, PersonalData, UserData, CollegeDetails, Department

def check_database_state():
    """Check the current state of all registration-related tables"""
    
    print("=== DATABASE STATE CHECK ===")
    
    # Check Users
    users = User.objects.all().order_by('-date_joined')[:5]
    print(f"\n1. Recent Users ({users.count()}):")
    for user in users:
        print(f"   - {user.username} ({user.email}) - {user.date_joined}")
    
    # Check Temp records
    temps = Temp.objects.filter(is_deleted=False).order_by('-created_date')[:5]
    print(f"\n2. Recent Temp Records ({temps.count()}):")
    for temp in temps:
        print(f"   - {temp.emp_id} ({temp.user.username}) - {temp.role} - {temp.created_date}")
    
    # Check UserData records
    user_data = UserData.objects.filter(emp_id__is_deleted=False).order_by('-created_date')[:5]
    print(f"\n3. Recent UserData Records ({user_data.count()}):")
    for ud in user_data:
        print(f"   - {ud.emp_id.emp_id} - {ud.user.username} - {ud.user_status} - {ud.department}")
    
    # Check PersonalData records
    personal_data = PersonalData.objects.filter(is_deleted=False).order_by('-created_date')[:5]
    print(f"\n4. Recent PersonalData Records ({personal_data.count()}):")
    for pd in personal_data:
        print(f"   - {pd.emp_id.emp_id} - {pd.user.username}")
    
    # Check CollegeDetails records
    college_data = CollegeDetails.objects.filter(is_deleted=False).order_by('-created_date')[:5]
    print(f"\n5. Recent CollegeDetails Records ({college_data.count()}):")
    for cd in college_data:
        print(f"   - {cd.emp_id.emp_id} - {cd.college_name}")
    
    # Check for orphaned records
    print(f"\n6. Orphaned Records Check:")
    
    # Users without Temp records
    users_without_temp = User.objects.exclude(temp__isnull=False).count()
    print(f"   - Users without Temp records: {users_without_temp}")
    
    # Temp records without UserData
    temps_without_userdata = Temp.objects.filter(
        is_deleted=False,
        role='intern'
    ).exclude(userdata__isnull=False).count()
    print(f"   - Intern Temp records without UserData: {temps_without_userdata}")
    
    # UserData records without PersonalData
    userdata_without_personal = UserData.objects.filter(
        emp_id__is_deleted=False,
        emp_id__role='intern'
    ).exclude(emp_id__personaldata__isnull=False).count()
    print(f"   - UserData records without PersonalData: {userdata_without_personal}")

def check_specific_intern(emp_id):
    """Check a specific intern's data across all tables"""
    
    print(f"\n=== CHECKING INTERN {emp_id} ===")
    
    try:
        temp = Temp.objects.get(emp_id=emp_id)
        print(f"✓ Temp record found: {temp.user.username} - {temp.role}")
        
        try:
            user_data = UserData.objects.get(emp_id=temp)
            print(f"✓ UserData found: {user_data.user_status} - {user_data.department}")
        except UserData.DoesNotExist:
            print("✗ UserData NOT found")
        
        try:
            personal_data = PersonalData.objects.get(emp_id=temp)
            print(f"✓ PersonalData found")
        except PersonalData.DoesNotExist:
            print("✗ PersonalData NOT found")
        
        try:
            college_data = CollegeDetails.objects.get(emp_id=temp)
            print(f"✓ CollegeDetails found: {college_data.college_name}")
        except CollegeDetails.DoesNotExist:
            print("✗ CollegeDetails NOT found")
            
    except Temp.DoesNotExist:
        print(f"✗ Temp record NOT found for {emp_id}")

if __name__ == "__main__":
    check_database_state()
    
    # Check specific intern if provided
    if len(sys.argv) > 1:
        emp_id = sys.argv[1]
        check_specific_intern(emp_id)