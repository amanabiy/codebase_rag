from flask import Flask
from flask_cors import CORS  # Import CORS
from routes.home import home_bp
from routes.chat import chat_bp
from routes.codespace import codespace_bp  # Import the codespace routes
from session_manager import before_request, teardown_request  # Import session management functions

app = Flask(__name__)
CORS(app)  # Enable CORS for the Flask app

@app.before_request
def before_request_wrapper():
    before_request()  # Call the function from session_manager

@app.teardown_request
def teardown_request_wrapper(exception):
    teardown_request(exception)  # Call the function from session_manager

# Register blueprints for different routes
app.register_blueprint(home_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(codespace_bp)  # Register the routes from codespace.py

if __name__ == "__main__":
    app.run(debug=True)