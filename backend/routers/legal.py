from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from database import get_session
from models import Act, Section

router = APIRouter(prefix="/legal", tags=["Legal Knowledge"])

@router.get("/acts", response_model=List[Act])
def read_acts(offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    acts = session.exec(select(Act).offset(offset).limit(limit)).all()
    return acts

@router.get("/acts/{act_id}", response_model=Act)
def read_act(act_id: int, session: Session = Depends(get_session)):
    act = session.get(Act, act_id)
    if not act:
        raise HTTPException(status_code=404, detail="Act not found")
    return act

@router.get("/acts/{act_id}/sections", response_model=List[Section])
def read_sections(act_id: int, offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    sections = session.exec(select(Section).where(Section.act_id == act_id).offset(offset).limit(limit)).all()
    return sections
