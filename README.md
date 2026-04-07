# ⚖️ Vidhi — AI-Powered Legal Learning Platform

**Vidhi** is an intelligent legal education platform that empowers users to understand, analyse, and engage with legal concepts through AI-driven tools. The platform combines document analysis, case simulation, and an interactive learning experience to make legal knowledge accessible.

---

## 🚀 Features

- 📄 **AI Document Analysis** — Upload and analyse legal contracts, agreements, and documents using LLM-powered insights (Groq API)
- 🧠 **Legal Q&A Assistant** — Ask legal questions and get accurate, contextual answers
- 📚 **Structured Learning Modules** — Topic-based modules covering core legal concepts
- ⚖️ **Mock Court Simulation** — Practice courtroom scenarios with AI-driven case dynamics
- 🔐 **Secure Authentication** — User accounts with role-based access
- 📦 **Vector Search** — Semantic search over legal documents using `pgvector`

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Frontend     | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend      | FastAPI (Python), Uvicorn            |
| Database     | PostgreSQL + `pgvector` extension    |
| AI / LLM     | Groq API                             |
| Containerization | Docker, Docker Compose           |

---

## 📁 Project Structure

```
Vidhi/
├── frontend/        # Next.js frontend application
│   ├── app/         # App Router pages & components
│   └── public/      # Static assets
├── backend/         # FastAPI backend service
│   ├── routers/     # API route handlers
│   ├── services/    # Business logic & AI integrations
│   ├── utils/       # Utility functions
│   └── main.py      # Application entrypoint
├── docker-compose.yml
└── RUN_PROCEDURE.txt
```

---

## ⚡ Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

### Option 2: Manual Setup

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

---

## 📜 License

This project is licensed under the MIT License.
