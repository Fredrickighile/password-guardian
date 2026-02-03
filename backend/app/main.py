from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import password_routes

app = FastAPI(
    title="PasswordGuardian API",
    description="AI-powered password security analysis platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://password-guardian-eight.vercel.app",
        "https://*.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(password_routes.router, prefix="/api/passwords", tags=["passwords"])

@app.get("/")
def root():
    return {"message": "PasswordGuardian API", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
