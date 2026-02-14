from fastapi import APIRouter
from pydantic import BaseModel
from datetime import date

from app.models.attendance import AttendanceStatus
from app.database import get_employees_collection, get_attendance_collection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class DashboardStats(BaseModel):
    """Dashboard statistics model."""
    total_employees: int
    present_today: int
    absent_today: int
    attendance_rate: float


@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="Get dashboard statistics",
    description="Get overview statistics including total employees and today's attendance."
)
async def get_dashboard_stats():
    """Get dashboard statistics."""
    employees_collection = get_employees_collection()
    attendance_collection = get_attendance_collection()
    
    # Get total employees
    total_employees = await employees_collection.count_documents({})
    
    # Get today's date
    today = date.today().isoformat()
    
    # Get today's attendance counts
    present_today = await attendance_collection.count_documents({
        "date": today,
        "status": AttendanceStatus.PRESENT.value,
    })
    
    absent_today = await attendance_collection.count_documents({
        "date": today,
        "status": AttendanceStatus.ABSENT.value,
    })
    
    # Calculate attendance rate
    total_marked_today = present_today + absent_today
    attendance_rate = (present_today / total_marked_today * 100) if total_marked_today > 0 else 0.0
    
    return DashboardStats(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        attendance_rate=round(attendance_rate, 1),
    )

