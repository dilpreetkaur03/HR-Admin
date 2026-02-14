#!/usr/bin/env python3
"""
API Integration Test Script for HRMS Lite
Run this script to test all API endpoints after setting up MongoDB.

Usage: python test_api.py
"""

import requests
import sys
from datetime import date

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("\n1. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    print("   ✓ Health check passed")

def test_create_employee():
    """Test creating an employee."""
    print("\n2. Testing create employee...")
    employee_data = {
        "employee_id": "TEST001",
        "full_name": "John Doe",
        "email": "john.doe@test.com",
        "department": "Engineering"
    }
    response = requests.post(f"{BASE_URL}/api/employees", json=employee_data)
    
    if response.status_code == 400:
        # Employee might already exist, try to delete and recreate
        requests.delete(f"{BASE_URL}/api/employees/TEST001")
        response = requests.post(f"{BASE_URL}/api/employees", json=employee_data)
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["employee_id"] == "TEST001"
    assert data["full_name"] == "John Doe"
    print("   ✓ Create employee passed")
    return data

def test_get_employees():
    """Test getting all employees."""
    print("\n3. Testing get all employees...")
    response = requests.get(f"{BASE_URL}/api/employees")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    print(f"   ✓ Get employees passed ({len(data)} employees found)")

def test_get_employee():
    """Test getting a specific employee."""
    print("\n4. Testing get employee by ID...")
    response = requests.get(f"{BASE_URL}/api/employees/TEST001")
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == "TEST001"
    print("   ✓ Get employee passed")

def test_mark_attendance():
    """Test marking attendance."""
    print("\n5. Testing mark attendance...")
    attendance_data = {
        "employee_id": "TEST001",
        "date": date.today().isoformat(),
        "status": "Present"
    }
    response = requests.post(f"{BASE_URL}/api/attendance", json=attendance_data)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["status"] == "Present"
    print("   ✓ Mark attendance passed")

def test_get_attendance():
    """Test getting attendance records."""
    print("\n6. Testing get attendance records...")
    response = requests.get(f"{BASE_URL}/api/attendance")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    print(f"   ✓ Get attendance passed ({len(data)} records found)")

def test_get_employee_attendance():
    """Test getting attendance for specific employee."""
    print("\n7. Testing get employee attendance...")
    response = requests.get(f"{BASE_URL}/api/attendance/employee/TEST001")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    print(f"   ✓ Get employee attendance passed ({len(data)} records)")

def test_attendance_summary():
    """Test attendance summary."""
    print("\n8. Testing attendance summary...")
    response = requests.get(f"{BASE_URL}/api/attendance/summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    print(f"   ✓ Attendance summary passed ({len(data)} employees)")

def test_dashboard_stats():
    """Test dashboard stats."""
    print("\n9. Testing dashboard stats...")
    response = requests.get(f"{BASE_URL}/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_employees" in data
    assert "present_today" in data
    print(f"   ✓ Dashboard stats passed (Total: {data['total_employees']}, Present: {data['present_today']})")

def test_delete_employee():
    """Test deleting an employee."""
    print("\n10. Testing delete employee...")
    response = requests.delete(f"{BASE_URL}/api/employees/TEST001")
    assert response.status_code == 204
    print("   ✓ Delete employee passed")

def test_validation_errors():
    """Test validation error handling."""
    print("\n11. Testing validation errors...")
    
    # Test invalid email
    invalid_data = {
        "employee_id": "TEST002",
        "full_name": "Test User",
        "email": "invalid-email",
        "department": "Test"
    }
    response = requests.post(f"{BASE_URL}/api/employees", json=invalid_data)
    assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
    print("   ✓ Invalid email validation passed")
    
    # Test missing fields
    incomplete_data = {"employee_id": "TEST002"}
    response = requests.post(f"{BASE_URL}/api/employees", json=incomplete_data)
    assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
    print("   ✓ Missing fields validation passed")

def test_not_found():
    """Test 404 handling."""
    print("\n12. Testing not found handling...")
    response = requests.get(f"{BASE_URL}/api/employees/NONEXISTENT")
    assert response.status_code == 404
    print("   ✓ Not found handling passed")

def main():
    print("=" * 50)
    print("HRMS Lite API Integration Tests")
    print("=" * 50)
    
    try:
        # Check if server is running
        try:
            requests.get(f"{BASE_URL}/health", timeout=5)
        except requests.exceptions.ConnectionError:
            print("\n❌ Error: Backend server is not running!")
            print("   Start the server with: uvicorn app.main:app --reload")
            sys.exit(1)
        
        # Run tests
        test_health()
        test_create_employee()
        test_get_employees()
        test_get_employee()
        test_mark_attendance()
        test_get_attendance()
        test_get_employee_attendance()
        test_attendance_summary()
        test_dashboard_stats()
        test_delete_employee()
        test_validation_errors()
        test_not_found()
        
        print("\n" + "=" * 50)
        print("✅ All tests passed!")
        print("=" * 50)
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection error - check if MongoDB is running")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


