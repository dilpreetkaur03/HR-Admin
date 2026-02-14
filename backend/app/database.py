from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
import certifi
import ssl

settings = get_settings()


class Database:
    """MongoDB database connection manager."""
    
    client: AsyncIOMotorClient = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB with proper SSL handling."""
        try:
            # First try with certifi CA bundle (works on most systems)
            cls.client = AsyncIOMotorClient(
                settings.mongodb_url,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000,
            )
            # Quick test to verify connection
            await cls.client.admin.command("ping")
            print("Connected to MongoDB (with certifi SSL)")
        except Exception:
            # Fallback: allow invalid certificates (for old LibreSSL on macOS)
            cls.client = AsyncIOMotorClient(
                settings.mongodb_url,
                tls=True,
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=10000,
            )
            await cls.client.admin.command("ping")
            print("Connected to MongoDB (with relaxed SSL)")
        
        print(f"Database: {settings.database_name}")
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB."""
        if cls.client:
            cls.client.close()
            print("Disconnected from MongoDB")
    
    @classmethod
    def get_database(cls):
        """Get the database instance."""
        return cls.client[settings.database_name]
    
    @classmethod
    def get_collection(cls, collection_name: str):
        """Get a collection from the database."""
        return cls.get_database()[collection_name]


# Collection names
EMPLOYEES_COLLECTION = "employees"
ATTENDANCE_COLLECTION = "attendance"


def get_employees_collection():
    """Get the employees collection."""
    return Database.get_collection(EMPLOYEES_COLLECTION)


def get_attendance_collection():
    """Get the attendance collection."""
    return Database.get_collection(ATTENDANCE_COLLECTION)


