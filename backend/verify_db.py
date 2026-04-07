import asyncio
from database import engine, get_session
from models import Act, Section
from sqlmodel import Session, select

async def verify_data():
    with Session(engine) as session:
        acts = session.exec(select(Act)).all()
        print(f"Total Acts: {len(acts)}")
        for act in acts:
            print(f"- {act.name} ({act.year}): {len(act.sections)} sections")
            for section in act.sections[:3]:
                print(f"  * {section.section_number}: {section.title}")

if __name__ == "__main__":
    asyncio.run(verify_data())
