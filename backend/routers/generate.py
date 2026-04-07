from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import ask_gemini
import json

router = APIRouter(prefix="/generate", tags=["Document Generator"])

class GenerateRequest(BaseModel):
    doc_type: str          # e.g. "Employment Agreement", "NDA", "Sale Deed", "Rental Agreement"
    party_a: str           # First party name & role
    party_b: str           # Second party name & role
    key_terms: str         # Plain-language description of key terms
    jurisdiction: str = "India"
    additional_context: str = ""

@router.post("/contract")
def generate_legal_document(req: GenerateRequest):
    prompt = f"""
Generate a professional, legally sound {req.doc_type} under Indian law.

PARTIES:
- Party A: {req.party_a}
- Party B: {req.party_b}

KEY TERMS:
{req.key_terms}

JURISDICTION: {req.jurisdiction}
ADDITIONAL CONTEXT: {req.additional_context}

Requirements:
1. Use formal legal language appropriate for Indian contracts
2. Include all standard clauses for this document type
3. Cite the relevant Indian Acts for each major clause (e.g. [Indian Contract Act 1872, s.10])
4. Include: Recitals, Definitions, Main Body, Representations & Warranties, Termination, Dispute Resolution (prefer arbitration per Arbitration & Conciliation Act 1996), Governing Law, Signatures
5. Mark each section with its legal basis

Return a JSON object:
{{
  "title": "<full document title>",
  "document": "<complete formatted legal document with all clauses>",
  "key_clauses": ["<list of main clauses included>"],
  "applicable_acts": ["<list of Indian acts cited>"],
  "warnings": ["<any important disclaimers or missing information>"]
}}

Return ONLY JSON, no markdown.
"""
    raw = ask_gemini(prompt)
    clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    try:
        return json.loads(clean)
    except Exception:
        return {"title": req.doc_type, "document": clean, "key_clauses": [], "applicable_acts": [], "warnings": ["AI response could not be parsed as structured JSON."]}
