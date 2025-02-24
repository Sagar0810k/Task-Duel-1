import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')  # Secret key for session management
    SQLALCHEMY_DATABASE_URI = os.getenv('DB_URI')  # Database connection string
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable modification tracking