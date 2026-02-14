from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class EmployeeBase(BaseModel):
    """Base employee model with common fields."""
    
    employee_id: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique employee identifier"
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Employee's full name"
    )
    email: EmailStr = Field(
        ...,
        description="Employee's email address"
    )
    department: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Employee's department"
    )


class EmployeeCreate(EmployeeBase):
    """Model for creating a new employee."""
    pass


class EmployeeInDB(EmployeeBase):
    """Model representing an employee stored in the database."""
    
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class EmployeeResponse(EmployeeBase):
    """Model for employee API responses."""
    
    id: str = Field(..., description="Database ID")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


