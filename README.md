# ⚖️ Vidhi — AI-Powered Legal Learning & Intelligence Platform

**Vidhi** is an intelligent legal platform that empowers users to understand, analyse, and generate legal documents through AI-driven tools. The platform combines document analysis, automated contract generation, case simulation, and an interactive learning experience to make legal knowledge accessible.

---

## ✨ Features

- 📄 **AI Document Analysis** — Upload and analyze legal contracts, agreements, and documents using LLM-powered insights. Includes OCR for scanned PDFs.
- ✍️ **Legal Document Generator** — Automatically generate fully structured, legally sound contracts (Rental, Employment, NDA, etc.) under Indian law with exact citations.
- 💬 **Legal Q&A Assistant** — Ask legal questions and get accurate, contextual answers formatted beautifully in Markdown.
- 📚 **Structured Learning Modules** — Topic-based modules covering core legal concepts.
- 🏛️ **Mock Court Simulation** — Practice courtroom scenarios with AI-driven case dynamics.
- 🔒 **Secure Authentication** — User accounts with role-based access.

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Frontend     | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend      | FastAPI (Python), Uvicorn            |
| Database     | PostgreSQL + SQLite (dev fallback)   |
| AI / LLM     | Groq API (Llama 3) / OCR.Space       |

---

## 📂 Project Structure

```
Vidhi/
├── frontend/        # Next.js frontend application
│   ├── app/         # App Router pages & components
│   └── public/      # Static assets
└── backend/         # FastAPI backend service
    ├── routers/     # API route handlers
    ├── services/    # Business logic & AI integrations
    ├── utils/       # Utility functions
    └── main.py      # Application entrypoint
```

---

## 🚀 Quick Start

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Linux/macOS

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql://vidhi_user:vidhi_password@localhost:5432/vidhi_db
GROQ_API_KEY=your_groq_api_key_here
```

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## 🗄️ Database Setup

1. Install **PostgreSQL** and the `pgvector` extension
2. Create the database and user:

```sql
CREATE USER vidhi_user WITH PASSWORD 'vidhi_password';
CREATE DATABASE vidhi_db OWNER vidhi_user;
```

3. Enable the `pgvector` extension:
```sql
\c vidhi_db
CREATE EXTENSION vector;
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
