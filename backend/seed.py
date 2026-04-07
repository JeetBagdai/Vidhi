import asyncio
import json
import os
from database import engine, create_db_and_tables
from models import Act, Section
from sqlmodel import Session, select, delete

DATA_FILE = "legal_data.json"

async def seed_data():
    print("Creating tables...")
    create_db_and_tables()
    
    if not os.path.exists(DATA_FILE):
        print(f"Data file {DATA_FILE} not found.")
        return

    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    with Session(engine) as session:
        for act_data in data:
            # Check if act exists
            existing_act = session.exec(select(Act).where(Act.name == act_data["act_name"])).first()
            if existing_act:
                print(f"Act '{act_data['act_name']}' already exists. Skipping creation, checking sections.")
                act = existing_act
            else:
                act = Act(
                    name=act_data["act_name"],
                    year=act_data["year"],
                    description=act_data["description"]
                )
                session.add(act)
                session.commit()
                session.refresh(act)
                print(f"Created Act: {act.name}")

            # Process Sections
            for section_data in act_data["sections"]:
                existing_section = session.exec(select(Section).where(
                    (Section.act_id == act.id) & 
                    (Section.section_number == section_data["section_number"])
                )).first()

                if not existing_section:
                    section = Section(
                        act_id=act.id,
                        section_number=section_data["section_number"],
                        title=section_data["title"],
                        content=section_data["content"],
                        embedding=[0.0]*1536 # Placeholder
                    )
                    session.add(section)
                    print(f"  Added {section.section_number}: {section.title}")
                else:
                    print(f"  Section {section_data['section_number']} already exists.")
            
            session.commit()
    
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())
