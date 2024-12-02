from langchain_pinecone import Pinecone, PineconeVectorStore
from sqlalchemy import create_engine, Column, Integer, String, or_
from sqlalchemy.ext.declarative import declarative_base
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from sqlalchemy.orm import sessionmaker
import os
import subprocess
from flask import Blueprint, Flask, jsonify, request  # Import Flask, jsonify, and request
from models.repository import Repository
from storage.storage import StorageManager  # Import the Repository model and engine
from storage.setup_db import engine
from dotenv import load_dotenv

load_dotenv()


def get_local_path(github_username, repo_name):
    """Get the local path of the cloned repository."""
    return os.path.join('temp_files/local_repos', f"{github_username}#{repo_name}")

def clone_repo(repo_url):
    storage_manager = StorageManager(engine, Repository)
    repo = storage_manager.get_by_column('url_path', repo_url)
    if repo:
        return repo_url
    # Create local_repos directory if it doesn't exist
    os.makedirs('./temp_files/local_repos', exist_ok=True)
    
    try:
        # Clone the repository
        repo_name = repo_url.split('/')[-1].replace('.git', '')
        github_username = repo_url.split('/')[-2]
        clone_path = get_local_path(github_username, repo_name)
        print("path", repo_url, clone_path)
        if os.path.exists(clone_path):
            print(f"Repository already exists at {clone_path}. Skipping clone.")
            return Repository(name=repo_name, local_path=clone_path, url_path=repo_url)  # Return existing repository info
        else:
            subprocess.run(['git', 'clone', repo_url, clone_path], check=True)  # Ensure it raises an error if the command fails
        
        # Initialize StorageManager for Repository
        new_repo = Repository(name=repo_name, local_path=clone_path, url_path=repo_url)
        create_vector_store_from_repo(new_repo)
        new_repo = Repository(**storage_manager.add(new_repo))  # Save the repository information
        # print("clone", new_repo)
        return new_repo
    except Exception as e:
        raise e # Return error message if cloning fails



SUPPORTED_EXTENSIONS = {'.py', '.js', '.tsx', '.jsx', '.ipynb', '.java',
                         '.cpp', '.ts', '.go', '.rs', '.vue', '.swift', '.c', '.h'}

IGNORED_DIRS = {'node_modules', 'venv', 'env', 'dist', 'build', '.git',
                '__pycache__', '.next', '.vscode', 'vendor'}

def get_file_content(file_path, repo_path):
    """
    Get content of a single file.

    Args:
        file_path (str): Path to the file

    Returns:
        Optional[Dict[str, str]]: Dictionary with file name and content
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Get relative path from repo root
        rel_path = os.path.relpath(file_path, repo_path)

        return {
            "name": rel_path,
            "content": content
        }
    except Exception as e:
        print(f"Error processing file {file_path}: {str(e)}")
        return None


def get_main_files_content(repo_path: str):
    """
    Get content of supported code files from the local repository.

    Args:
        repo_path: Path to the local repository

    Returns:
        List of dictionaries containing file names and contents
    """
    files_content = []

    try:
        for root, _, files in os.walk(repo_path):
            # Skip if current directory is in ignored directories
            if any(ignored_dir in root for ignored_dir in IGNORED_DIRS):
                continue

            # Process each file in current directory
            for file in files:
                file_path = os.path.join(root, file)
                if os.path.splitext(file)[1] in SUPPORTED_EXTENSIONS:
                    file_content = get_file_content(file_path, repo_path)
                    if file_content:
                        files_content.append(file_content)

    except Exception as e:
        print(f"Error reading repository: {str(e)}")

    return files_content


def create_vector_store_from_repo(repo):
    """Create a Pinecone vector store from the repository's files."""
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    print(pinecone_api_key)
    
    vectorstore = PineconeVectorStore(index_name="codebase-rag", embedding=HuggingFaceEmbeddings())
    
    documents = []
    file_content = get_main_files_content(repo.local_path)

    for file in file_content:
        # Check if the content size exceeds the limit (40960 bytes)
        if len(file['content'].encode('utf-8')) > 40960:  # Check size in bytes
            print(f"Skipping file {file['name']} due to size limit.")
            continue  # Skip appending this document if it exceeds the limit
        
        doc = Document(
            page_content=f"{file['name']}\n{file['content']}",
            metadata={"source": file['name']}
        )
        documents.append(doc)

    vectorstore = PineconeVectorStore.from_documents(
        documents=documents,
        embedding=HuggingFaceEmbeddings(),
        index_name="codebase-rag",
        namespace=repo.url_path
    )
    return vectorstore  # Return the created vector store


# Initialize the Flask application
codespace_bp = Blueprint('codespace', __name__)  # Change app to codespace_bp

@codespace_bp.route('/repositories', methods=['GET'])  # Update route decorators
def get_repositories():
    # Initialize StorageManager for Repository
    storage_manager = StorageManager(engine, Repository)
    repositories = storage_manager.get_all()  # Get all repositories
    
    # Convert the repository objects to a list of dictionaries
    repo_list = [repo.to_dict() for repo in repositories]
    
    return jsonify(repo_list)  # Return the list as JSON

@codespace_bp.route('/clone', methods=['POST'])  # Update route decorators
def clone_repository():
    data = request.get_json()  # Get the JSON data from the request
    repo_url = data.get('url')  # Extract the repository URL from the data
    
    if not repo_url:
        return jsonify({'error': 'Repository URL is required'}), 400  # Return error if URL is missing
    print("url", repo_url)
    repo = clone_repo(repo_url)  # Call the clone_repo function with the provided URL
    # print(repo)
    # vectorstore = create_vector_store_from_repo(repo)  # Call the new function to create the vector store

    return jsonify({'message': 'Repository cloned successfully'}), 201  # Return success message

@codespace_bp.route('/search', methods=['GET'])  # Update route decorators
def search_repositories():
    search_term = request.args.get('query')  # Get the search term from query parameters
    
    if not search_term:
        return get_repositories()  # Return error if search term is missing
    
    # Initialize StorageManager for Repository
    storage_manager = StorageManager(engine, Repository)
    repositories = storage_manager.search(search_term, 'url')  # Search for repositories by name
    
    # Convert the repository objects to a list of dictionaries
    repo_list = [repo.to_dict() for repo in repositories]
    
    return jsonify(repo_list)  # Return the list as JSON
