import re
import math
import string
from typing import Dict, List

class PasswordAnalyzer:
    def __init__(self):
        self.common_patterns = [
            r'(012|123|234|345|456|567|678|789|890)',
            r'(qwer|asdf|zxcv)',
            r'(pass|word|admin|user|login)',
        ]
        
        self.keyboard_patterns = [
            'qwerty', 'asdfgh', 'zxcvbn',
            '1qaz2wsx', 'qazwsx', 'qwertyuiop'
        ]
        
        self.leet_speak_map = {
            'a': ['4', '@'],
            'e': ['3'],
            'i': ['1', '!'],
            'o': ['0'],
            's': ['5', '$'],
            't': ['7'],
            'l': ['1'],
        }
    
    def analyze(self, password: str) -> Dict:
        if not password:
            return self._empty_result()
        
        length_score = self._calculate_length_score(password)
        complexity_score = self._calculate_complexity_score(password)
        pattern_penalty = self._detect_patterns(password)
        entropy = self._calculate_entropy(password)
        
        total_score = max(0, min(100, 
            (length_score * 0.3) + 
            (complexity_score * 0.4) + 
            (pattern_penalty * 0.3)
        ))
        
        strength = self._get_strength_level(total_score)
        crack_time = self._estimate_crack_time(entropy)
        suggestions = self._generate_suggestions(password, total_score)
        
        return {
            "score": round(total_score, 2),
            "strength": strength,
            "entropy": round(entropy, 2),
            "crack_time": crack_time,
            "length": len(password),
            "has_uppercase": any(c.isupper() for c in password),
            "has_lowercase": any(c.islower() for c in password),
            "has_numbers": any(c.isdigit() for c in password),
            "has_special": any(c in string.punctuation for c in password),
            "common_pattern_detected": pattern_penalty < 100,
            "leet_speak_detected": self._detect_leet_speak(password),
            "suggestions": suggestions
        }
    
    def _calculate_length_score(self, password: str) -> float:
        length = len(password)
        if length < 8:
            return 0
        elif length < 12:
            return 40
        elif length < 16:
            return 70
        else:
            return 100
    
    def _calculate_complexity_score(self, password: str) -> float:
        score = 0
        if any(c.isupper() for c in password):
            score += 25
        if any(c.islower() for c in password):
            score += 25
        if any(c.isdigit() for c in password):
            score += 25
        if any(c in string.punctuation for c in password):
            score += 25
        return score
    
    def _detect_patterns(self, password: str) -> float:
        penalty = 100
        password_lower = password.lower()
        
        for pattern in self.common_patterns:
            if re.search(pattern, password_lower):
                penalty -= 30
        
        for keyboard_pattern in self.keyboard_patterns:
            if keyboard_pattern in password_lower:
                penalty -= 40
        
        for i in range(len(password) - 2):
            if password[i:i+3] == password[i] * 3:
                penalty -= 20
                break
        
        return max(0, penalty)
    
    def _detect_leet_speak(self, password: str) -> bool:
        for char, replacements in self.leet_speak_map.items():
            for replacement in replacements:
                if replacement in password:
                    return True
        return False
    
    def _calculate_entropy(self, password: str) -> float:
        charset_size = 0
        
        if any(c.islower() for c in password):
            charset_size += 26
        if any(c.isupper() for c in password):
            charset_size += 26
        if any(c.isdigit() for c in password):
            charset_size += 10
        if any(c in string.punctuation for c in password):
            charset_size += 32
        
        if charset_size == 0:
            return 0
        
        entropy = len(password) * math.log2(charset_size)
        return entropy
    
    def _estimate_crack_time(self, entropy: float) -> str:
        attempts_per_second = 1e9
        total_combinations = 2 ** entropy
        seconds = total_combinations / attempts_per_second
        
        if seconds < 1:
            return "Instant"
        elif seconds < 60:
            return f"{int(seconds)} seconds"
        elif seconds < 3600:
            return f"{int(seconds / 60)} minutes"
        elif seconds < 86400:
            return f"{int(seconds / 3600)} hours"
        elif seconds < 2592000:
            return f"{int(seconds / 86400)} days"
        elif seconds < 31536000:
            return f"{int(seconds / 2592000)} months"
        else:
            years = int(seconds / 31536000)
            if years > 1000000:
                return "Centuries"
            return f"{years} years"
    
    def _get_strength_level(self, score: float) -> str:
        if score < 25:
            return "Very Weak"
        elif score < 50:
            return "Weak"
        elif score < 70:
            return "Moderate"
        elif score < 85:
            return "Strong"
        else:
            return "Very Strong"
    
    def _generate_suggestions(self, password: str, score: float) -> List[str]:
        suggestions = []
        
        if len(password) < 12:
            suggestions.append("Increase password length to at least 12 characters")
        if not any(c.isupper() for c in password):
            suggestions.append("Add uppercase letters")
        if not any(c.islower() for c in password):
            suggestions.append("Add lowercase letters")
        if not any(c.isdigit() for c in password):
            suggestions.append("Add numbers")
        if not any(c in string.punctuation for c in password):
            suggestions.append("Add special characters")
        if self._detect_leet_speak(password):
            suggestions.append("Avoid simple letter-to-number substitutions")
        
        if not suggestions:
            suggestions.append("Password meets security requirements")
        
        return suggestions
    
    def _empty_result(self) -> Dict:
        return {
            "score": 0,
            "strength": "Invalid",
            "entropy": 0,
            "crack_time": "N/A",
            "length": 0,
            "has_uppercase": False,
            "has_lowercase": False,
            "has_numbers": False,
            "has_special": False,
            "common_pattern_detected": False,
            "leet_speak_detected": False,
            "suggestions": ["Please enter a password"]
        }
