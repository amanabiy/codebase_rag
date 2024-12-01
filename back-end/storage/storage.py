from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from session_manager import Session

Base = declarative_base()  # Define the base class for declarative models

class StorageManager:
    def __init__(self, engine, model):
        self.engine = engine
        self.model = model
        self.Session = Session
        Base.metadata.create_all(self.engine)  # Create the table if it doesn't exist

    def get_session(self):
        return self.Session()

    def add(self, instance):
        """Add an instance to the database with session management."""
        session = self.get_session()
        a = instance.to_dict()
        try:
            session.add(instance)
            print(instance)
            session.commit()
        except Exception as e:
            session.rollback()  # Rollback in case of error
            raise e  # Re-raise the exception for handling elsewhere
        finally:
            session.close()  # Ensure the session is closed
        return a

    def get_all(self):
        """Retrieve all instances from the database."""
        session = self.get_session()
        try:
            instances = session.query(self.model).all()
            return instances
        finally:
            session.close()  # Ensure the session is closed

    def search(self, search_term, column_name):
        """Search for instances based on a search term in a specified column."""
        session = self.get_session()
        try:
            instances = session.query(self.model).filter(getattr(self.model, column_name).ilike(f'%{search_term}%')).all()
            return instances
        finally:
            session.close()  # Ensure the session is closed

    def get(self, instance_id):
        """Retrieve an instance by its ID."""
        session = self.get_session()
        try:
            instance = session.query(self.model).get(instance_id)  # Retrieve instance by ID
            return instance
        finally:
            session.close()  # Ensure the session is closed
