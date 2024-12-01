from flask import Blueprint, request, jsonify, Response
from openai import OpenAI
from langchain_pinecone import PineconeVectorStore
import os
import tempfile
import pinecone
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from langchain.schema import Document
from git import Repo
from dotenv import load_dotenv

# Initialize the Blueprint
chat_bp = Blueprint('chat', __name__)

# Load environment variables from .env file
load_dotenv()

# Function to get embeddings from HuggingFace
def get_huggingface_embeddings(text, model_name="sentence-transformers/all-mpnet-base-v2"):
    model = SentenceTransformer(model_name)
    return model.encode(text)

# Function to perform RAG (Retrieval Augmented Generation)
def perform_rag(query, namespace, stream_response=False):
    raw_query_embedding = get_huggingface_embeddings(query)
    
    print("raw_query_embedding", raw_query_embedding)
    # Set the PINECONE_API_KEY as an environment variable
    pinecone_api_key = os.getenv('PINECONE_API_KEY')

    # Initialize Pinecone
    pc = Pinecone(api_key=pinecone_api_key)

    # Connect to your Pinecone index
    pinecone_index = pc.Index("codebase-rag")

    top_matches = pinecone_index.query(vector=raw_query_embedding.tolist(), top_k=5, include_metadata=True, namespace=namespace)

    print("top_matches", top_matches)
    # Get the list of retrieved texts
    contexts = [item['metadata']['text'] for item in top_matches['matches']]

    augmented_query = "<CONTEXT>\n" + "\n\n-------\n\n".join(contexts[:5]) + "\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n" + query

    # Modify the prompt to improve the response
    system_prompt = f"""You are a Senior Software Engineer, specializing in TypeScript.

    Answer any questions I have about the codebase, based on the code provided. Always consider all of the context provided when forming a response.
    """

    llm_response = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv('GROQ_API_KEY')
    ).chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": augmented_query}
        ],
        stream=stream_response
    )

    # if stream_response:
    #     # Yield the response content as it becomes available
    #     for chunk in llm_response:
    #         print(chunk.choices[0].delta.content)
    #         content = chunk.choices[0].delta.content
    #         if content:
    #             yield content.encode('utf-8')
    # else:
        # Collect the full response when not streaming
    print(llm_response.choices[0].message.content)
    return llm_response.choices[0].message.content  # Return the full response

# Route to handle chat messages
@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    query = data.get("query")
    repo_id = data.get("repo_id")  # Get the repository ID from the request
    chat_history = data.get("chat_history", [])  # Accept chat history from the front-end
    stream_response = data.get("stream_response", False)  # Get the stream_response parameter

    if query:
        # Append the current query to the chat history
        chat_history.append({"role": "user", "content": query})

        # Return a response based on the stream_response parameter
        # if stream_response:
        #     return Response(perform_rag(query, namespace="https://github.com/CoderAgent/SecureAgent", stream_response=stream_response), mimetype='text/event-stream' if stream_response else 'application/json')
        # else:
        return jsonify(perform_rag(query, namespace="https://github.com/CoderAgent/SecureAgent", stream_response=stream_response))
    else:
        return jsonify({"error": "Query is missing!"}), 400
