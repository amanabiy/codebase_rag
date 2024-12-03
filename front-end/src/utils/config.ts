export interface Config {
    backendUrl: string;
    port: number;
}

// Configuration object
const config: Config = {
    // Get the backend URL from environment variables, or use a default if not set
    backendUrl: process.env.BACKEND_URL || 'https://2a4a-23-94-117-101.ngrok-free.app', // Fallback to localhost if not set

    // Get the port number from environment variables or use 5000 by default
    port: parseInt(process.env.REACT_APP_PORT || '5000', 10), // Default to 5000 if not set
};

// Export configuration object
export default config;
