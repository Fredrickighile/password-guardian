
import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If in production and no env var, use production URL
  if (import.meta.env.PROD) {
    return 'https://passwordguardian-api.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiUrl();

export interface PasswordAnalysis {
  score: number;
  strength: string;
  entropy: number;
  crack_time: string;
  length: number;
  has_uppercase: boolean;
  has_lowercase: boolean;
  has_numbers: boolean;
  has_special: boolean;
  common_pattern_detected: boolean;
  leet_speak_detected: boolean;
  suggestions: string[];
  breach_count: number;
}

export const analyzePassword = async (password: string): Promise<PasswordAnalysis> => {
  const response = await axios.post(`${API_BASE_URL}/api/passwords/analyze`, {
    password,
  });
  return response.data;
};
