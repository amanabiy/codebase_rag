from flask import Flask
from flask_cors import CORS
from routes.home import home_bp
from routes.chat import chat_bp
from routes.codespace import codespace_bp
from session_manager import before_request, teardown_request
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

@app.before_request
def before_request_wrapper():
    before_request()

@app.teardown_request
def teardown_request_wrapper(exception):
    teardown_request(exception)

# Register blueprints for different routes
app.register_blueprint(home_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(codespace_bp)

if __name__ == "__main__":
    debug = os.getenv("DEBUG", "False").lower() in ['true', '1', 't']
    app.run(debug=debug)
