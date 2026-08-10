from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
from routers import legal, cases, contracts, generate, chat, learn, mock_court

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Vidhi — Indian Legal Intelligence Platform", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(legal.router)
app.include_router(cases.router)
app.include_router(contracts.router)
app.include_router(generate.router)
app.include_router(chat.router)
app.include_router(learn.router)
app.include_router(mock_court.router)

@app.get("/")
def read_root():
    return {
        "platform": "Vidhi",
        "version": "2.0.0",
        "capabilities": [
            "Contract Analysis & Red-flagging",
            "Legal Document Generation",
            "Micro-learning",
            "Case Evaluation (Plaintiff & Defendant)",
            "Legal Chat Engine",
            "Mock Court"
        ]
    }
