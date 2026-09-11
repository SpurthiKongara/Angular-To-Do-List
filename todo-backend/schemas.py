from datetime import datetime, date
from pydantic import BaseModel


class TodoCreate(BaseModel):
    title: str
    category: str
    due_date: date | None = None
    tags: str | None = None


class TodoUpdate(BaseModel):
    title: str
    category: str
    due_date: date | None = None
    tags: str | None = None
    completed: bool


class TodoResponse(BaseModel):
    id: int
    title: str
    category: str
    due_date: date | None = None
    tags: str | None = None
    completed: bool
    created_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True