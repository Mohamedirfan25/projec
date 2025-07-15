# Debug script to check registration data flow
import requests
import json

def debug_registration_flow():
    """
    Debug script to test the complete registration flow
    """
    base_url = "http://localhost:8000/Sims"
    token = "YOUR_TOKEN_HERE"  # Replace with actual token
    
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    
    # Test data
    test_data = {
        "username": "test_intern_debug",
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Intern",
        "department": "Computer Science",
        "role": "intern"
    }
    
    print("=== DEBUGGING REGISTRATION FLOW ===")
    
    # Step 1: Check if user registration works
    try:
        response = requests.post(f"{base_url}/register/", json=test_data, headers=headers)
        print(f"1. User Registration: {response.status_code}")
        if response.status_code == 201:
            user_data = response.json()
            emp_id = user_data.get('emp_id')
            print(f"   Created emp_id: {emp_id}")
        else:
            print(f"   Error: {response.text}")
            return
    except Exception as e:
        print(f"   Exception: {e}")
        return
    
    # Step 2: Check Temp record
    try:
        response = requests.get(f"{base_url}/temps/{emp_id}/", headers=headers)
        print(f"2. Temp Record: {response.status_code}")
        if response.status_code != 200:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Step 3: Check UserData creation
    try:
        user_data_payload = {
            "emp_id": emp_id,
            "domain": "Full Stack",
            "scheme": "FREE",
            "start_date": "2024-01-01",
            "end_date": "2024-06-01"
        }
        response = requests.post(f"{base_url}/user-data/", json=user_data_payload, headers=headers)
        print(f"3. UserData Creation: {response.status_code}")
        if response.status_code != 201:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Step 4: Check if intern appears in list
    try:
        response = requests.get(f"{base_url}/user-data/", headers=headers)
        print(f"4. Fetch Intern List: {response.status_code}")
        if response.status_code == 200:
            interns = response.json()
            found = any(intern.get('emp_id') == emp_id for intern in interns)
            print(f"   Intern found in list: {found}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

if __name__ == "__main__":
    debug_registration_flow()