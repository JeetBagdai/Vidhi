import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

MODEL = "llama-3.3-70b-versatile"

INDIA_LAW_SYSTEM_CONTEXT = """You are Vidhi, an AI-powered Indian Legal Intelligence Assistant.

MANDATORY RULES:
1. You MUST cite specific Indian Acts, section numbers, and clauses for every legal point you make.
2. Use only current, applicable Indian law. Key acts include:
   - Indian Contract Act, 1872 (ICA)
   - Bharatiya Nyaya Sanhita, 2023 (BNS) [replaces IPC]
   - Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) [replaces CrPC]
   - Consumer Protection Act, 2019 (CPA)
   - Constitution of India, 1950
   - Code of Civil Procedure, 1908 (CPC)
   - Specific Relief Act, 1963
   - Information Technology Act, 2000
   - Transfer of Property Act, 1882
   - Companies Act, 2013
   - Arbitration and Conciliation Act, 1996
   - Hindu Marriage Act, 1955
   - Copyright Act, 1957
   - Trade Marks Act, 1999
   - POCSO Act, 2012
3. Format citations as: [Act Name, Section X] or [Act Name, s.X]
4. Be precise, professional, and actionable.
5. Never give advice outside Indian legal jurisdiction unless explicitly asked."""


def ask_gemini(prompt: str, system_extra: str = "") -> str:
    """Primary LLM call. Name kept for backward compatibility."""
    try:
        system = INDIA_LAW_SYSTEM_CONTEXT
        if system_extra:
            system += "\n" + system_extra

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"


def ask_gemini_chat(history: list, new_message: str, system_extra: str = "") -> str:
    """Chat-style call maintaining conversation history.
    history format: [{"role": "user"/"model", "parts": ["text"]}]
    Converts from Gemini format to OpenAI-compatible format used by Groq.
    """
    try:
        system = INDIA_LAW_SYSTEM_CONTEXT
        if system_extra:
            system += "\n" + system_extra

        # Convert Gemini history format to OpenAI format
        messages = [{"role": "system", "content": system}]
        for msg in history:
            role = "assistant" if msg.get("role") == "model" else msg.get("role", "user")
            content = msg.get("parts", [""])[0] if isinstance(msg.get("parts"), list) else msg.get("content", "")
            messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": new_message})

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=4096,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"
