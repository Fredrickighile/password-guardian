from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.password_analyzer import RealMLPasswordAnalyzer
import httpx

router = APIRouter()
analyzer = RealMLPasswordAnalyzer()

class PasswordRequest(BaseModel):
    password: str

class PasswordResponse(BaseModel):
    score: float
    strength: str
    ml_prediction: int
    ml_confidence: float
    entropy: float
    crack_time: str
    length: int
    has_uppercase: bool
    has_lowercase: bool
    has_numbers: bool
    has_special: bool
    common_pattern_detected: bool
    leet_speak_detected: bool
    suggestions: list
    breach_count: int = 0
    feature_importance: dict

@router.post("/analyze", response_model=PasswordResponse)
async def analyze_password(request: PasswordRequest):
    if not request.password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    
    analysis = analyzer.analyze(request.password)
    breach_count = await check_breach(request.password)
    
    return PasswordResponse(**analysis, breach_count=breach_count)

async def check_breach(password: str) -> int:
    try:
        import hashlib
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.pwnedpasswords.com/range/{prefix}",
                timeout=5.0
            )
            
            if response.status_code == 200:
                hashes = response.text.split('\r\n')
                for hash_line in hashes:
                    hash_suffix, count = hash_line.split(':')
                    if hash_suffix == suffix:
                        return int(count)
        
        return 0
    except Exception:
        return 0
