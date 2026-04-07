from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.llm_service import ask_gemini, ask_gemini_chat
import json

router = APIRouter(prefix="/chat", tags=["Legal Chat"])

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    domain: str = "general"  # e.g. "criminal", "civil", "consumer", "family", "contract"

@router.post("/")
def legal_chat(req: ChatRequest):
    # Convert history format for Gemini
    gemini_history = [
        {"role": msg.role, "parts": [msg.content]}
        for msg in req.history
    ]

    domain_context = f"The user is asking about {req.domain} law in India. " if req.domain != "general" else ""
    
    system_extra = f"""
{domain_context}
When answering:
- Always cite the specific Act and section number
- Give practical examples where helpful  
- If the question involves a potential legal situation, explain the user's rights and options
- Structure longer answers with clear headings
- At the end of each answer, suggest 1-2 follow-up questions the user might want to ask
"""
    
    response_text = ask_gemini_chat(
        history=gemini_history,
        new_message=req.message,
        system_extra=system_extra
    )
    
    return {
        "response": response_text,
        "domain": req.domain
    }

@router.get("/suggested-questions")
def get_suggested_questions():
    return {
        "questions": [
            "What are my rights if a seller refuses to refund a defective product?",
            "What constitutes a valid contract under Indian law?",
            "Can I file an FIR if someone cheated me online?",
            "What is the process to challenge wrongful termination?",
            "How do I protect my startup's intellectual property in India?",
            "What are the grounds for divorce in India?",
            "What is the difference between cognizable and non-cognizable offences?",
        ]
    }
