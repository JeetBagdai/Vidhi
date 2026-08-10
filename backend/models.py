from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

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

    act: Optional[Act] = Relationship(back_populates="sections")

class Case(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    status: str = "pending"
    risk_score: Optional[float] = None
