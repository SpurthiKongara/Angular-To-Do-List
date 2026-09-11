from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Todo
from schemas import TodoCreate, TodoUpdate, TodoResponse


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Todo API")


# Allow Angular to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:4200",
    "https://angular-todo-frontend-rho.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Home
@app.get("/")
def home():
    return {"message": "Todo API is running"}


# Get all todos
@app.get("/todos", response_model=list[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    return db.query(Todo).order_by(Todo.created_at.desc()).all()


# Add todo
@app.post("/todos", response_model=TodoResponse)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):

    new_todo = Todo(
        title=todo.title,
        category=todo.category,
        due_date=todo.due_date,
        tags=todo.tags,
        completed=False,
        created_at=datetime.now(),
        completed_at=None
    )

    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)

    return new_todo


# Update todo
@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo: TodoUpdate,
    db: Session = Depends(get_db)
):

    existing_todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if not existing_todo:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    existing_todo.title = todo.title
    existing_todo.category = todo.category
    existing_todo.due_date = todo.due_date
    existing_todo.tags = todo.tags

    # Set completion time when task becomes completed
    if todo.completed and not existing_todo.completed:
        existing_todo.completed_at = datetime.now()

    # Remove completion time when task becomes pending
    elif not todo.completed:
        existing_todo.completed_at = None

    existing_todo.completed = todo.completed

    db.commit()
    db.refresh(existing_todo)

    return existing_todo


# Delete todo
@app.delete("/todos/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db)
):

    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if not todo:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    db.delete(todo)
    db.commit()

    return {"message": "Todo deleted successfully"}