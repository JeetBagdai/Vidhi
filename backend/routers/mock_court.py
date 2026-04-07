from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.llm_service import ask_gemini
import json, random

router = APIRouter(prefix="/mock-court", tags=["Mock Court"])

# In-memory session store
court_sessions: dict = {}
session_counter = 0

MOCK_CASES = [
    {
        "id": "mc001",
        "title": "Sharma vs. TechHire Pvt. Ltd.",
        "category": "Employment",
        "difficulty": "Beginner",
        "summary": "Rohan Sharma, a software engineer, was terminated without notice after 3 years. He claims wrongful termination. TechHire argues performance-based dismissal.",
        "facts": "Rohan Sharma was employed by TechHire Pvt. Ltd. since Jan 2020. On March 5, 2023, he was terminated via email with no prior warning. He had a performance review in Jan 2023 rating him 'meets expectations'. No formal PIP was issued.",
        "plaintiff": "Rohan Sharma",
        "defendant": "TechHire Pvt. Ltd.",
        "key_acts": ["Industrial Disputes Act 1947", "Indian Contract Act 1872"]
    },
    {
        "id": "mc002",
        "title": "Priya Mehta vs. QuickBuy E-commerce",
        "category": "Consumer",
        "difficulty": "Beginner",
        "summary": "Priya purchased a laptop that arrived damaged. QuickBuy refuses refund citing 'opened box policy'.",
        "facts": "Priya Mehta ordered a laptop worth ₹65,000 on QuickBuy. Delivered on Oct 10, 2023 with cracked screen (visible without opening). QuickBuy's policy states no returns on opened electronics. Consumer Forum jurisdiction applies.",
        "plaintiff": "Priya Mehta",
        "defendant": "QuickBuy E-commerce",
        "key_acts": ["Consumer Protection Act 2019", "Contract Act 1872"]
    },
    {
        "id": "mc003",
        "title": "State vs. Accused (Cyber Fraud)",
        "category": "Criminal",
        "difficulty": "Intermediate",
        "summary": "The accused allegedly ran an online investment scam defrauding 50+ victims of ₹2 crore.",
        "facts": "Accused ran a website promising 30% monthly returns. 52 victims invested ₹2.1 crore total. No returns were paid. Website taken down after FIR. Digital evidence includes transaction records and WhatsApp chats.",
        "plaintiff": "State of Maharashtra",
        "defendant": "Accused",
        "key_acts": ["Bharatiya Nyaya Sanhita 2023", "IT Act 2000", "PMLA 2002"]
    }
]

class StartCourtRequest(BaseModel):
    case_id: str
    user_role: str  # "prosecution" or "defence"

class ArgumentRequest(BaseModel):
    session_id: str
    argument: str

@router.get("/cases")
def list_cases():
    return {"cases": MOCK_CASES}

@router.post("/start")
def start_mock_court(req: StartCourtRequest):
    global session_counter
    case = next((c for c in MOCK_CASES if c["id"] == req.case_id), None)
    if not case:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Case not found")
    
    session_counter += 1
    session_id = f"court_{session_counter}"
    
    opponent_role = "defence" if req.user_role == "prosecution" else "prosecution"
    
    court_sessions[session_id] = {
        "case": case,
        "user_role": req.user_role,
        "opponent_role": opponent_role,
        "turn": 1,
        "history": [],
        "score": {"user": 0, "opponent": 0},
        "status": "active"
    }
    
    # Opening statement from judge
    judge_opening = f"""
Court is in session. This is the matter of {case['title']}.

CASE SUMMARY: {case['summary']}

KEY FACTS:
{case['facts']}

APPLICABLE LAWS: {', '.join(case['key_acts'])}

The {req.user_role} will argue their position. The court expects arguments to be grounded in Indian law with specific section citations. You may begin your opening statement.
"""
    
    return {
        "session_id": session_id,
        "case": case,
        "user_role": req.user_role,
        "opponent_role": opponent_role,
        "judge_opening": judge_opening.strip(),
        "turn": 1,
        "instructions": f"You are the {req.user_role}. Make your legal arguments citing specific Indian Acts and sections. The AI will play both the opposing {opponent_role} and the judge."
    }


@router.post("/argue")
def submit_argument(req: ArgumentRequest):
    session = court_sessions.get(req.session_id)
    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session["status"] != "active":
        return {"error": "Case is already concluded", "status": session["status"]}
    
    case = session["case"]
    history_text = "\n".join([f"[{h['speaker']}]: {h['text']}" for h in session["history"]])
    
    prompt = f"""
You are running a mock court simulation under Indian law.

CASE: {case['title']}
FACTS: {case['facts']}
RELEVANT ACTS: {', '.join(case['key_acts'])}

ARGUMENT HISTORY SO FAR:
{history_text if history_text else "No arguments yet. This is the first argument."}

THE {session['user_role'].upper()} (user) JUST ARGUED:
"{req.argument}"

You must play TWO roles and respond in JSON:

1. JUDGE: Evaluate the user's argument for legal accuracy, citation quality, and persuasiveness. Score it 0-10.
2. OPPOSING COUNSEL ({session['opponent_role'].upper()}): Respond to the user's argument with a strong counter-argument citing specific Indian Acts and sections.

It is turn {session['turn']} of the hearing.
{"If this is turn 4 or above, add a 'should_conclude' field set to true to signal the case is ready for verdict." if session['turn'] >= 4 else ""}

Return JSON:
{{
  "judge_comment": "<judge's evaluation of the argument - cite whether legal points are correct>",
  "argument_score": <0-10 integer>,
  "score_reason": "<why you gave this score>",
  "opponent_argument": "<opposing counsel's counter-argument with Indian Act citations>",
  "key_legal_points_raised": ["<Acts/sections used in this round>"],
  "should_conclude": false
}}

Return ONLY JSON.
"""
    
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    
    try:
        response = json.loads(clean)
    except Exception:
        response = {
            "judge_comment": "The court notes your argument.",
            "argument_score": 5,
            "score_reason": "Standard legal argument.",
            "opponent_argument": clean,
            "key_legal_points_raised": [],
            "should_conclude": False
        }
    
    # Update session
    session["history"].append({"speaker": session["user_role"], "text": req.argument})
    session["history"].append({"speaker": session["opponent_role"], "text": response.get("opponent_argument", "")})
    session["score"]["user"] += response.get("argument_score", 0)
    session["turn"] += 1
    
    result = {
        "session_id": req.session_id,
        "turn": session["turn"],
        "judge_comment": response.get("judge_comment"),
        "argument_score": response.get("argument_score", 0),
        "score_reason": response.get("score_reason"),
        "opponent_argument": response.get("opponent_argument"),
        "key_legal_points_raised": response.get("key_legal_points_raised", []),
        "cumulative_score": session["score"]["user"],
        "should_conclude": response.get("should_conclude", False)
    }
    
    if result["should_conclude"]:
        session["status"] = "concluded"
    
    return result


@router.post("/verdict/{session_id}")
def get_verdict(session_id: str):
    session = court_sessions.get(session_id)
    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")
    
    case = session["case"]
    history_text = "\n".join([f"[{h['speaker']}]: {h['text']}" for h in session["history"]])
    total_score = session["score"]["user"]
    max_possible = session["turn"] * 10
    
    prompt = f"""
A mock court hearing has concluded. As the judge, deliver your final verdict.

CASE: {case['title']}
RELEVANT ACTS: {', '.join(case['key_acts'])}

FULL ARGUMENT HISTORY:
{history_text}

THE {session['user_role'].upper()} scored {total_score} points out of a possible {max_possible}.

Deliver a formal judicial verdict. Return JSON:
{{
  "verdict": "<In favour of [plaintiff/defendant]>",
  "reasoning": "<detailed judicial reasoning with Indian Act citations - 3-4 paragraphs>",
  "user_performance": {{
    "grade": "<A/B/C/D>",
    "score_percentage": <percentage>,
    "strongest_argument": "<best argument the user made>",
    "weakest_point": "<where the user could improve>",
    "legal_accuracy": "<assessment of citation quality>"
  }},
  "learning_notes": ["<key Indian law lesson from this case>"],
  "final_message": "<encouraging note for the law student>"
}}

Return ONLY JSON.
"""
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    
    session["status"] = "concluded"
    
    try:
        return json.loads(clean)
    except Exception:
        return {"verdict": "Judgment reserved", "reasoning": clean, "user_performance": {"grade": "B", "score_percentage": 60}}
