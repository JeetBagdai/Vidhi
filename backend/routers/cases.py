from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.llm_service import ask_gemini
import json

router = APIRouter(prefix="/cases", tags=["Case Evaluation"])

# In-memory store for case sessions (replace with DB in production)
case_sessions: dict = {}
session_counter = 0

class CaseIntakeRequest(BaseModel):
    title: str
    role: str = "plaintiff"  # "plaintiff" or "defendant"
    domain: str              # e.g. "consumer", "employment", "criminal", "family", "contract"
    facts: str               # Initial facts description

class QuestionnaireResponse(BaseModel):
    session_id: str
    answers: dict  # {question_id: answer}

@router.post("/intake")
def case_intake(req: CaseIntakeRequest):
    global session_counter
    session_counter += 1
    session_id = f"case_{session_counter}"
    
    prompt = f"""
A person acting as {req.role} in a {req.domain} law matter in India has described their situation:

"{req.facts}"

Generate a targeted questionnaire to gather ALL information needed for a complete legal evaluation. Create 5-8 highly specific questions based on the domain and facts.

Return JSON:
{{
  "domain": "{req.domain}",
  "questionnaire": [
    {{
      "id": "q1",
      "question": "<specific question>",
      "type": "text|date|yesno|select",
      "options": ["<only if type=select>"],
      "why_important": "<brief reason this info matters legally>"
    }}
  ],
  "preliminary_observation": "<1 sentence immediate legal observation about the situation>",
  "applicable_acts": ["<immediately relevant Indian Acts based on what you know so far>"]
}}

Return ONLY JSON.
"""
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    
    try:
        questionnaire_data = json.loads(clean)
    except Exception:
        questionnaire_data = {"questionnaire": [], "preliminary_observation": clean, "applicable_acts": []}
    
    # Store session
    case_sessions[session_id] = {
        "title": req.title,
        "role": req.role,
        "domain": req.domain,
        "facts": req.facts,
        "questionnaire": questionnaire_data
    }
    
    return {"session_id": session_id, **questionnaire_data}


@router.post("/evaluate")
def evaluate_case(req: QuestionnaireResponse):
    session = case_sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Case session not found. Start with /cases/intake first.")
    
    role = session["role"]
    perspective = "plaintiff filing the case" if role == "plaintiff" else "defendant defending against the case"
    
    answers_text = "\n".join([f"- {k}: {v}" for k, v in req.answers.items()])
    
    prompt = f"""
You are evaluating the legal position of a {perspective} in India.

DOMAIN: {session['domain']}
INITIAL FACTS: {session['facts']}

ANSWERS TO QUESTIONNAIRE:
{answers_text}

Provide a comprehensive legal evaluation. Return JSON:
{{
  "strength_score": <0-100 integer, where 100 is strongest possible case>,
  "verdict": "<Strong|Moderate|Weak>",
  "legal_summary": "<2-3 sentence professional summary of the legal situation>",
  "key_strengths": ["<strength with Indian Act citation>"],
  "key_weaknesses": ["<weakness with explanation>"],
  "applicable_sections": [
    {{
      "act": "<Act Name, Year>",
      "section": "<section number>",
      "relevance": "<how this section applies to the case>"
    }}
  ],
  "recommended_action": "<step-by-step recommended legal action>",
  "documents_needed": ["<list of documents/evidence needed>"],
  "time_limitation": "<any limitation period under Indian law, e.g. 'Limitation Act 1963, s.X - 3 years from date of cause'>",
  "estimated_relief": "<what remedy/relief can be expected if successful>",
  "professional_advice": "<when and why to engage a lawyer>"
}}

Return ONLY JSON.
"""
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    
    try:
        result = json.loads(clean)
    except Exception:
        result = {"strength_score": 50, "verdict": "Moderate", "legal_summary": clean}
    
    return result
