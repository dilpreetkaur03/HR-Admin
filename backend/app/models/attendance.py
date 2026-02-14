from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from datetime import date as DateType
from enum import Enum


class AttendanceStatus(str, Enum):
    """Attendance status enum."""
    
    PRESENT = "Present"
    ABSENT = "Absent"


class AttendanceBase(BaseModel):
    """Base attendance model with common fields."""
    
    employee_id: str = Field(
        ...,
        description="Employee's unique identifier"
    )
    date: DateType = Field(
        ...,
        description="Attendance date"
    )
    status: AttendanceStatus = Field(
        ...,
        description="Attendance status (Present/Absent)"
    )


class AttendanceCreate(AttendanceBase):
    """Model for creating/updating attendance."""
    pass


class AttendanceInDB(AttendanceBase):
    """Model representing attendance stored in the database."""
    
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class AttendanceResponse(AttendanceBase):
    """Model for attendance API responses."""
    
    id: str = Field(..., description="Database ID")
    employee_name: Optional[str] = Field(None, description="Employee's full name")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    """Model for attendance summary per employee."""
    
    employee_id: str
    employee_name: str
    total_present: int
    total_absent: int
    total_days: int

