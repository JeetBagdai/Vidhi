from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from utils.parser import parse_document
from services.llm_service import ask_gemini
import tempfile, os, shutil

router = APIRouter(prefix="/contracts", tags=["Contracts"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AnalyzeRequest(BaseModel):
    context: str = ""  # e.g. "Employment contract between employer and employee in Mumbai"

@router.post("/analyze")
async def analyze_contract(
    file: UploadFile = File(...),
    context: str = ""
):
    # Save file temporarily
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        text_content = parse_document(tmp_path, file.content_type or "")
    finally:
        os.unlink(tmp_path)

    if not text_content or len(text_content.strip()) < 20:
        raise HTTPException(status_code=422, detail="Could not extract text from document.")

    prompt = f"""
You are analyzing a legal document. The context provided by the user is: "{context}"

DOCUMENT TEXT:
---
{text_content[:6000]}
---

Analyze this document and return a valid JSON object with this exact structure:
{{
  "risk_score": <integer 0-100 where 100 is highest risk>,
  "summary": "<2-3 sentence summary of what this document is>",
  "flagged_clauses": [
    {{
      "clause_title": "<name of clause>",
      "clause_excerpt": "<relevant text from document, max 100 chars>",
      "risk_level": "<High|Medium|Low>",
      "issue": "<what is problematic and why, citing Indian law>",
      "act_citation": "<e.g. Indian Contract Act 1872, s.74>",
      "counter_suggestion": "<alternative phrasing or counter-clause to offer>"
    }}
  ],
  "missing_clauses": ["<clause missing that should be present>"],
  "overall_assessment": "<professional legal assessment paragraph>"
}}

Return ONLY the JSON object, no markdown, no explanation.
"""
    
    raw = ask_gemini(prompt)
    
    # Clean up response (remove markdown code fences if present)
    clean = raw.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    if clean.endswith("```"):
        clean = clean[:-3]
    clean = clean.strip()
    
    import json
    try:
        result = json.loads(clean)
    except Exception:
        result = {
            "risk_score": 50,
            "summary": "Analysis complete.",
            "flagged_clauses": [],
            "missing_clauses": [],
            "overall_assessment": clean
        }
    
    result["text_preview"] = text_content[:500]
    result["filename"] = file.filename
    return result


@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "location": file_location, "status": "uploaded"}
