from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

import app.models

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)