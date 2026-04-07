from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import ask_gemini
import json

router = APIRouter(prefix="/learn", tags=["Micro-learning"])

MODULES = [
    {"id": "contracts-101", "title": "Contracts 101", "icon": "📝", "level": "Beginner", "lessons": 5, "description": "What makes a contract valid in India", "acts": ["Indian Contract Act 1872"]},
    {"id": "consumer-rights", "title": "Consumer Rights", "icon": "🛡️", "level": "Beginner", "lessons": 4, "description": "Know your consumer rights and how to use them", "acts": ["Consumer Protection Act 2019"]},
    {"id": "criminal-basics", "title": "Criminal Law Basics", "icon": "⚖️", "level": "Intermediate", "lessons": 6, "description": "FIR, bail, cognizable vs non-cognizable offences", "acts": ["Bharatiya Nyaya Sanhita 2023", "BNSS 2023"]},
    {"id": "property-law", "title": "Property & Rent", "icon": "🏠", "level": "Intermediate", "lessons": 5, "description": "Tenant rights, property disputes, and transfer of property", "acts": ["Transfer of Property Act 1882", "Rent Control Acts"]},
    {"id": "startup-law", "title": "Startup & Business Law", "icon": "🚀", "level": "Advanced", "lessons": 6, "description": "Incorporation, IP protection, and compliance for startups", "acts": ["Companies Act 2013", "Copyright Act 1957", "Trade Marks Act 1999"]},
    {"id": "family-law", "title": "Family Law", "icon": "👨‍👩‍👧", "level": "Intermediate", "lessons": 5, "description": "Marriage, divorce, custody, and maintenance in India", "acts": ["Hindu Marriage Act 1955", "Special Marriage Act 1954"]},
]

class LessonRequest(BaseModel):
    module_id: str
    lesson_number: int = 1

class AnswerRequest(BaseModel):
    module_id: str
    lesson_number: int
    question_id: str
    user_answer: str
    correct_answer: str = ""

@router.get("/modules")
def get_modules():
    return {"modules": MODULES}

@router.post("/lesson")
def get_lesson(req: LessonRequest):
    module = next((m for m in MODULES if m["id"] == req.module_id), None)
    if not module:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Module not found")
    
    prompt = f"""
Create lesson {req.lesson_number} of {module['lessons']} for the module "{module['title']}" about: {module['description']}.
Relevant Indian Acts: {', '.join(module['acts'])}

This follows the Duolingo-style: SHORT, EXAMPLE-DRIVEN, INTERACTIVE.

Return JSON with this structure:
{{
  "lesson_title": "<title of this specific lesson>",
  "concept": "<core legal concept in 2-3 simple sentences with an Indian Act citation>",
  "real_example": {{
    "scenario": "<a realistic Indian scenario (e.g. a shopkeeper, a tenant, an employee)>",
    "what_happened": "<the legal situation that arose>",
    "what_the_law_says": "<exact relevant law with section number>",
    "outcome": "<what happened legally and why>"
  }},
  "quick_fact": "<a surprising or important legal fact most Indians don't know>",
  "interactive_question": {{
    "id": "q1",
    "type": "mcq",
    "question": "<scenario-based question about this lesson's concept>",
    "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
    "correct_answer": "<A|B|C|D>",
    "explanation": "<why this answer is correct, citing the relevant section>"
  }},
  "key_takeaway": "<one sentence: the most important thing to remember>",
  "act_citation": "<primary Act and section covered in this lesson>"
}}

Return ONLY JSON.
"""
    
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    
    try:
        lesson = json.loads(clean)
    except Exception:
        lesson = {"lesson_title": f"Lesson {req.lesson_number}", "concept": clean}
    
    lesson["module"] = module
    lesson["lesson_number"] = req.lesson_number
    lesson["total_lessons"] = module["lessons"]
    
    return lesson


@router.post("/check-answer")
def check_answer(req: AnswerRequest):
    prompt = f"""
A student answered a legal quiz question about {req.module_id}.

Question related to lesson {req.lesson_number}.
Their answer: "{req.user_answer}"
Correct answer: "{req.correct_answer}" (may be empty - use your judgment)

Is the answer correct? Give encouraging, educational feedback citing the relevant Indian law.

Return JSON:
{{
  "is_correct": <true|false>,
  "feedback": "<encouraging feedback explaining the correct answer with Act citation>",
  "bonus_fact": "<a related interesting legal fact>",
  "xp_earned": <10 if correct, 5 if partially correct, 2 if wrong but tried>
}}
Return ONLY JSON.
"""
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    try:
        return json.loads(clean)
    except Exception:
        return {"is_correct": False, "feedback": clean, "xp_earned": 2}
