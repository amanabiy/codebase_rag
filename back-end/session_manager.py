from flask import g
from sqlalchemy.orm import sessionmaker
from storage.setup_db import engine  # Ensure you import your engine

# Create a session factory
Session = sessionmaker(bind=engine)

def before_request():
    """Create a new session before each request."""
    g.session = Session()

def teardown_request(exception):
    """Close the session after each request."""
    session = g.pop('session', None)
    if session is not None:
        session.close() 