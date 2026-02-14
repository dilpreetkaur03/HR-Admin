from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId

from app.models.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceStatus,
    AttendanceSummary,
)
from app.database import get_employees_collection, get_attendance_collection

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


async def get_employee_name(employee_id: str) -> Optional[str]:
    """Get employee name by employee_id."""
    collection = get_employees_collection()
    employee = await collection.find_one({"employee_id": employee_id})
    return employee["full_name"] if employee else None


def attendance_helper(attendance: dict, employee_name: Optional[str] = None) -> dict:
    """Convert MongoDB document to response format."""
    return {
        "id": str(attendance["_id"]),
        "employee_id": attendance["employee_id"],
        "date": attendance["date"],
        "status": attendance["status"],
        "employee_name": employee_name,
        "created_at": attendance["created_at"],
        "updated_at": attendance["updated_at"],
    }


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark attendance",
    description="Mark attendance for an employee. Updates if attendance for the date already exists."
)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark or update attendance for an employee."""
    employees_collection = get_employees_collection()
    attendance_collection = get_attendance_collection()
    
    # Verify employee exists
    employee = await employees_collection.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found"
        )
    
    now = datetime.utcnow()
    
    # Check if attendance already exists for this employee and date
    existing = await attendance_collection.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
    })
    
    if existing:
        # Update existing attendance
        await attendance_collection.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "status": attendance.status.value,
                    "updated_at": now,
                }
            }
        )
        existing["status"] = attendance.status.value
        existing["updated_at"] = now
        return attendance_helper(existing, employee["full_name"])
    
    # Create new attendance record
    attendance_doc = {
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
        "status": attendance.status.value,
        "created_at": now,
        "updated_at": now,
    }
    
    result = await attendance_collection.insert_one(attendance_doc)
    attendance_doc["_id"] = result.inserted_id
    
    return attendance_helper(attendance_doc, employee["full_name"])


@router.get(
    "",
    response_model=List[AttendanceResponse],
    summary="Get all attendance records",
    description="Retrieve all attendance records with optional date filtering."
)
async def get_all_attendance(
    start_date: Optional[date] = Query(None, description="Filter from this date"),
    end_date: Optional[date] = Query(None, description="Filter until this date"),
):
    """Get all attendance records with optional date filtering."""
    attendance_collection = get_attendance_collection()
    employees_collection = get_employees_collection()
    
    # Build query
    query = {}
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = start_date.isoformat()
        if end_date:
            date_query["$lte"] = end_date.isoformat()
        query["date"] = date_query
    
    # Get all employees for name lookup
    employees = {}
    async for emp in employees_collection.find():
        employees[emp["employee_id"]] = emp["full_name"]
    
    # Get attendance records
    records = []
    async for attendance in attendance_collection.find(query).sort("date", -1):
        employee_name = employees.get(attendance["employee_id"])
        records.append(attendance_helper(attendance, employee_name))
    
    return records


@router.get(
    "/employee/{employee_id}",
    response_model=List[AttendanceResponse],
    summary="Get attendance for an employee",
    description="Retrieve all attendance records for a specific employee."
)
async def get_employee_attendance(
    employee_id: str,
    start_date: Optional[date] = Query(None, description="Filter from this date"),
    end_date: Optional[date] = Query(None, description="Filter until this date"),
):
    """Get attendance records for a specific employee."""
    employees_collection = get_employees_collection()
    attendance_collection = get_attendance_collection()
    
    # Verify employee exists
    employee = await employees_collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Build query
    query = {"employee_id": employee_id}
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = start_date.isoformat()
        if end_date:
            date_query["$lte"] = end_date.isoformat()
        query["date"] = date_query
    
    # Get attendance records
    records = []
    async for attendance in attendance_collection.find(query).sort("date", -1):
        records.append(attendance_helper(attendance, employee["full_name"]))
    
    return records


@router.get(
    "/summary",
    response_model=List[AttendanceSummary],
    summary="Get attendance summary",
    description="Get attendance summary for all employees."
)
async def get_attendance_summary():
    """Get attendance summary for all employees."""
    employees_collection = get_employees_collection()
    attendance_collection = get_attendance_collection()
    
    summaries = []
    
    async for employee in employees_collection.find():
        employee_id = employee["employee_id"]
        
        # Count present and absent days
        present_count = await attendance_collection.count_documents({
            "employee_id": employee_id,
            "status": AttendanceStatus.PRESENT.value,
        })
        
        absent_count = await attendance_collection.count_documents({
            "employee_id": employee_id,
            "status": AttendanceStatus.ABSENT.value,
        })
        
        summaries.append(AttendanceSummary(
            employee_id=employee_id,
            employee_name=employee["full_name"],
            total_present=present_count,
            total_absent=absent_count,
            total_days=present_count + absent_count,
        ))
    
    return summaries


