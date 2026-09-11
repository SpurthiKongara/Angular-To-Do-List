import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Todo {
  id: number;
  title: string;
  category: string;
  due_date: string | null;
  tags: string | null;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private apiUrl = 'https://angular-todo-backend-br3j.onrender.com/todos';

  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  addTodo(
    title: string,
    category: string,
    due_date: string | null,
    tags: string
  ): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, {
      title: title,
      category: category,
      due_date: due_date,
      tags: tags,
    });
  }

  updateTodo(
    id: number,
    title: string,
    category: string,
    due_date: string | null,
    tags: string,
    completed: boolean
  ): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, {
      title: title,
      category: category,
      due_date: due_date,
      tags: tags,
      completed: completed,
    });
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
