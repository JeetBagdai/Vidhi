from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column

class Act(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    year: int
    description: Optional[str] = None
    
    sections: List["Section"] = Relationship(back_populates="act")

class Section(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    act_id: int = Field(foreign_key="act.id")
    section_number: str
    title: str
    content: str
    embedding: List[float] = Field(sa_column=Column(Vector(1536))) # OpenAI embedding size, adjust if using different model
    
    act: Optional[Act] = Relationship(back_populates="sections")

class Case(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    status: str = "pending"
    risk_score: Optional[float] = None
