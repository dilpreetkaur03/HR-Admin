from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import date

from app.config import get_settings
from app.database import Database, get_employees_collection, get_attendance_collection
from app.routes import employees_router, attendance_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    await Database.connect()
    yield
    # Shutdown
    await Database.disconnect()


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="A lightweight Human Resource Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(employees_router)
app.include_router(attendance_router)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Welcome to HRMS Lite API",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/dashboard/stats", tags=["Dashboard"])
async def get_dashboard_stats():
    """Get dashboard statistics."""
    employees_collection = get_employees_collection()
    attendance_collection = get_attendance_collection()
    
    # Get total employees count
    total_employees = await employees_collection.count_documents({})
    
    # Get today's date in ISO format
    today = date.today().isoformat()
    
    # Count present and absent today
    present_today = await attendance_collection.count_documents({
        "date": today,
        "status": "Present"
    })
    
    absent_today = await attendance_collection.count_documents({
        "date": today,
        "status": "Absent"
    })
    
    # Calculate attendance rate (if there are attendance records today)
    attendance_rate = 0.0
    total_marked_today = present_today + absent_today
    if total_marked_today > 0:
        attendance_rate = round((present_today / total_marked_today) * 100, 1)
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "attendance_rate": attendance_rate,
        "date": today
    }

