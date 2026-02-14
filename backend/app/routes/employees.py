from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.models.employee import EmployeeCreate, EmployeeResponse
from app.database import get_employees_collection, get_attendance_collection

router = APIRouter(prefix="/api/employees", tags=["Employees"])


def employee_helper(employee: dict) -> dict:
    """Convert MongoDB document to response format."""
    return {
        "id": str(employee["_id"]),
        "employee_id": employee["employee_id"],
        "full_name": employee["full_name"],
        "email": employee["email"],
        "department": employee["department"],
        "created_at": employee["created_at"],
        "updated_at": employee["updated_at"],
    }


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new employee",
    description="Create a new employee record with unique employee ID and email."
)
async def create_employee(employee: EmployeeCreate):
    """Create a new employee."""
    collection = get_employees_collection()
    
    # Check for duplicate employee_id
    existing_by_id = await collection.find_one({"employee_id": employee.employee_id})
    if existing_by_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with ID '{employee.employee_id}' already exists"
        )
    
    # Check for duplicate email
    existing_by_email = await collection.find_one({"email": employee.email})
    if existing_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with email '{employee.email}' already exists"
        )
    
    # Create employee document
    now = datetime.utcnow()
    employee_doc = {
        **employee.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    
    result = await collection.insert_one(employee_doc)
    employee_doc["_id"] = result.inserted_id
    
    return employee_helper(employee_doc)


@router.get(
    "",
    response_model=List[EmployeeResponse],
    summary="Get all employees",
    description="Retrieve a list of all employees."
)
async def get_all_employees():
    """Get all employees."""
    collection = get_employees_collection()
    employees = []
    
    async for employee in collection.find().sort("created_at", -1):
        employees.append(employee_helper(employee))
    
    return employees


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get employee by ID",
    description="Retrieve a specific employee by their employee ID."
)
async def get_employee(employee_id: str):
    """Get a specific employee by employee_id."""
    collection = get_employees_collection()
    
    employee = await collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    return employee_helper(employee)


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an employee",
    description="Delete an employee and all their attendance records."
)
async def delete_employee(employee_id: str):
    """Delete an employee and their attendance records."""
    employees_collection = get_employees_collection()
    attendance_collection = get_attendance_collection()
    
    # Check if employee exists
    employee = await employees_collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Delete employee's attendance records
    await attendance_collection.delete_many({"employee_id": employee_id})
    
    # Delete employee
    await employees_collection.delete_one({"employee_id": employee_id})
    
    return None


