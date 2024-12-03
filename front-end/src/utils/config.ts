export interface Config {
    backendUrl: string;
    port: number;
}

// Configuration object
const config: Config = {
    // Get the backend URL from environment variables, or use a default if not set
    backendUrl: process.env.BACKEND_URL || 'http://localhost:5000', // Fallback to localhost if not set

    // Get the port number from environment variables or use 5000 by default
    port: parseInt(process.env.REACT_APP_PORT || '5000', 10), // Default to 5000 if not set
};

// Export configuration object
export default config;
