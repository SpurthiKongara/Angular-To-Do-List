from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from database import Base


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    due_date = Column(Date, nullable=True)
    tags = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)