
import axios from 'axios';

const API_BASE_URL = 'https://passwordguardian-api.onrender.com';

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
