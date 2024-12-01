# AI Expert Codebase Chatbot

## Overview

This project involves creating an AI expert over a codebase using Retrieval-Augmented Generation (RAG). The goal is to implement a web app that allows users to chat with a codebase, facilitating understanding and improvement of the code.

## Features

- **Chat with Codebase**: Users can input queries, and the most relevant code snippets are retrieved to generate responses using a Language Model (LLM).
- **Embedding Codebase**: The contents of the codebase are embedded and stored in a vector database called Pinecone for efficient retrieval.
- **Web App**: A user-friendly interface for interacting with the codebase.

## Getting Started

### Prerequisites

- Python 3.x
- Flask
- Pinecone SDK
- Any other dependencies listed in `requirements.txt`

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

python3 -m venv venv
source venv/bin/activate
pip freeze > requirements.txt

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your Pinecone account and initialize the database.

4. Run the Flask application:
   ```bash
   python app.py
   ```

5. Access the web app at `http://localhost:5000`.

## Additional Challenges

If you finish early, consider implementing the following features:

- **Multimodal RAG**: Add support for image uploads when chatting with the codebase.
- **Multiple Codebases**: Allow users to select different codebases to chat with.
- **Webhook Integration**: Update the Pinecone index automatically when new commits are pushed to the repository.
- **Simultaneous Chats**: Enable chatting with multiple codebases at the same time.

## Resources

- [Streamlit Documentation](https://docs.streamlit.io/)
- [AI Chatbot Template on Vercel](https://vercel.com/templates)
- [Example Web App](<example-url>)
- [RAG Workshop Recording](<recording-url>)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
