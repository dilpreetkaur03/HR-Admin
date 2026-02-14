# HRMS Lite - Human Resource Management System

A lightweight, full-stack Human Resource Management System for managing employee records and tracking daily attendance.

![HRMS Lite](https://img.shields.io/badge/HRMS-Lite-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

## 🚀 Live Demo

- **Frontend:** [Live URL - To be added after deployment]
- **Backend API:** [Live URL - To be added after deployment]

## 📋 Features

### Employee Management
- ✅ Add new employees with validation
- ✅ View all employees in a searchable grid
- ✅ Delete employees (cascades to attendance records)
- ✅ Unique employee ID and email validation

### Attendance Management
- ✅ Mark daily attendance (Present/Absent)
- ✅ View attendance records with filtering
- ✅ Filter by date range and employee
- ✅ Attendance summary per employee

### Dashboard
- ✅ Total employees count
- ✅ Today's present/absent count
- ✅ Attendance rate percentage
- ✅ Employee attendance summary table

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router DOM

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB (Atlas)
- **ODM:** Motor (async MongoDB driver)
- **Validation:** Pydantic

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## 📁 Project Structure

```
Assessment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Settings & configuration
│   │   ├── database.py      # MongoDB connection
│   │   ├── models/          # Pydantic models
│   │   │   ├── employee.py
│   │   │   └── attendance.py
│   │   └── routes/          # API endpoints
│   │       ├── employees.py
│   │       └── attendance.py
│   ├── requirements.txt
│   └── test_api.py          # Integration tests
│
└── frontend/
    ├── src/
    │   ├── api/             # API client services
    │   ├── components/      # Reusable UI components
    │   │   └── ui/          # Button, Input, Modal, etc.
    │   ├── pages/           # Page components
    │   │   ├── Dashboard.tsx
    │   │   ├── Employees.tsx
    │   │   └── Attendance.tsx
    │   ├── types/           # TypeScript interfaces
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free tier)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Assessment
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account and cluster
3. Create a database user with password
4. Get your connection string
5. Whitelist your IP address (or allow all: 0.0.0.0/0)

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env_sample.txt .env
# Edit .env and add your MongoDB Atlas connection string

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Run Tests

```bash
cd backend
source venv/bin/activate
python test_api.py
```

## 📡 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API welcome message |
| GET | `/health` | Health check |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Create new employee |
| GET | `/api/employees/{id}` | Get employee by ID |
| DELETE | `/api/employees/{id}` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get all attendance (with filters) |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/employee/{id}` | Get employee attendance |
| GET | `/api/attendance/summary` | Get attendance summary |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## 🔒 Validation Rules

### Employee
- `employee_id`: Required, unique, 1-50 characters
- `full_name`: Required, 2-100 characters
- `email`: Required, valid email format, unique
- `department`: Required, 1-100 characters

### Attendance
- `employee_id`: Required, must exist in employees
- `date`: Required, valid date format
- `status`: Required, "Present" or "Absent"

## 🎨 UI Features

- **Dark Theme:** Modern, professional dark interface
- **Responsive:** Works on mobile, tablet, and desktop
- **Loading States:** Smooth loading indicators
- **Empty States:** Helpful messages when no data
- **Error Handling:** User-friendly error messages
- **Form Validation:** Real-time client-side validation

## ⚙️ Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb+srv://...
DATABASE_NAME=hrms_lite
DEBUG=true
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## 📝 Assumptions & Limitations

1. **Single Admin:** No authentication required (assumed single admin user)
2. **Basic HR Features:** Leave management and payroll are out of scope
3. **Attendance:** One entry per employee per day (upsert behavior)
4. **Timezone:** Dates are stored in UTC/ISO format

## 🙏 Acknowledgments

- Built with React, FastAPI, and MongoDB
- Icons by Lucide React
- Styled with TailwindCSS

---

**Built for HRMS Lite Assessment** 🚀


