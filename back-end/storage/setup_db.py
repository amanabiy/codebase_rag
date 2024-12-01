from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

def setup_database():
    engine = create_engine('sqlite:///temp_files/ssq.db')
    Base.metadata.create_all(engine)  # Create the table if it doesn't exist
    # Add additional setup steps here
    return engine

# Call the setup_database function to initialize the database
engine = setup_database()