import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo as ApiTodo } from './todo.service';

interface Todo {
  id: number;
  title: string;
  category: string;
  dueDate: string | null;
  tags: string[];
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  // Form
  newTodo = '';
  selectedCategory = 'Study';
  dueDate = '';
  newTags = '';

  // Search / Filter / Sort
  searchText = '';
  selectedFilter = 'All';
  selectedTag = 'All';
  selectedSort = 'Newest';

  // Edit
  editingTodoId: number | null = null;

  // Categories
  categories = [
    'Study',
    'Work',
    'Personal',
    'Health',
    'Hobby',
    'Finance',
    'Travel',
    'Other',
  ];

  // Tags
  tagFilters = [
    'All',
    'Urgent',
    'Important',
    'College',
    'Personal',
    'Work',
    'Health',
    'Other',
  ];

  // Todos
  todos: Todo[] = [];

  constructor(private todoService: TodoService) {}

  // Load todos when application starts
  ngOnInit() {
    this.loadTodos();
  }

  // Load from FastAPI
  loadTodos() {
    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos = data.map((todo: ApiTodo) => ({
          id: todo.id,
          title: todo.title,
          category: todo.category,
          dueDate: todo.due_date,
          tags: todo.tags
            ? todo.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag)
            : [],
          completed: todo.completed,
          createdAt: new Date(todo.created_at),
          completedAt: todo.completed_at ? new Date(todo.completed_at) : null,
        }));
      },

      error: (error) => {
        console.error('Error loading todos:', error);
      },
    });
  }

  // Filter + Search + Sort
  get filteredTodos(): Todo[] {
    let result = [...this.todos];

    // Status filter
    if (this.selectedFilter === 'Completed') {
      result = result.filter((todo) => todo.completed);
    }

    if (this.selectedFilter === 'Pending') {
      result = result.filter((todo) => !todo.completed);
    }

    // Category filter
    if (
      this.selectedFilter !== 'All' &&
      this.selectedFilter !== 'Completed' &&
      this.selectedFilter !== 'Pending' &&
      this.categories.includes(this.selectedFilter)
    ) {
      result = result.filter((todo) => todo.category === this.selectedFilter);
    }

    // Search
    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();

      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(search) ||
          todo.category.toLowerCase().includes(search) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Tag filter
    // Tag / Category filter
    if (this.selectedTag !== 'All') {
      result = result.filter((todo) => todo.category === this.selectedTag);
    }

    // Sort
    switch (this.selectedSort) {
      case 'Newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;

      case 'Oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;

      case 'A-Z':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case 'Z-A':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;

      case 'Due Date':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        break;
    }

    return result;
  }

  // Add Todo
  addTodo() {
    if (this.newTodo.trim() === '') {
      return;
    }

    const tags = this.newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '')
      .join(', ');

    this.todoService
      .addTodo(
        this.newTodo.trim(),
        this.selectedCategory,
        this.dueDate || null,
        tags
      )
      .subscribe({
        next: (data) => {
          this.todos.unshift({
            id: data.id,
            title: data.title,
            category: data.category,
            dueDate: data.due_date,
            tags: data.tags
              ? data.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag)
              : [],
            completed: data.completed,
            createdAt: new Date(data.created_at),
            completedAt: data.completed_at ? new Date(data.completed_at) : null,
          });

          this.clearForm();
        },

        error: (error) => {
          console.error('Error adding todo:', error);
        },
      });
  }

  // Edit Todo
  editTodo(todo: Todo) {
    this.editingTodoId = todo.id;

    this.newTodo = todo.title;

    this.selectedCategory = todo.category;

    this.dueDate = todo.dueDate || '';

    this.newTags = todo.tags.join(', ');
  }

  // Update Todo
  updateTodo() {
    if (this.newTodo.trim() === '' || this.editingTodoId === null) {
      return;
    }

    const todo = this.todos.find((t) => t.id === this.editingTodoId);

    if (!todo) {
      return;
    }

    const tags = this.newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '')
      .join(', ');

    this.todoService
      .updateTodo(
        todo.id,
        this.newTodo.trim(),
        this.selectedCategory,
        this.dueDate || null,
        tags,
        todo.completed
      )
      .subscribe({
        next: (data) => {
          todo.title = data.title;

          todo.category = data.category;

          todo.dueDate = data.due_date;

          todo.tags = data.tags
            ? data.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag)
            : [];

          this.cancelEdit();
        },

        error: (error) => {
          console.error('Error updating todo:', error);
        },
      });
  }

  // Cancel Edit
  cancelEdit() {
    this.editingTodoId = null;
    this.clearForm();
  }

  // Clear form
  clearForm() {
    this.newTodo = '';
    this.selectedCategory = 'Study';
    this.dueDate = '';
    this.newTags = '';
  }

  // Delete Todo
  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter((todo) => todo.id !== id);
      },

      error: (error) => {
        console.error('Error deleting todo:', error);
      },
    });
  }

  // Complete / Pending
  toggleTodo(todo: Todo) {
    const newCompletedStatus = !todo.completed;

    this.todoService
      .updateTodo(
        todo.id,
        todo.title,
        todo.category,
        todo.dueDate,
        todo.tags.join(', '),
        newCompletedStatus
      )
      .subscribe({
        next: (data) => {
          todo.completed = data.completed;

          todo.completedAt = data.completed_at
            ? new Date(data.completed_at)
            : null;
        },

        error: (error) => {
          console.error('Error updating todo:', error);
        },
      });
  }

  // Total tasks
  get totalTasks(): number {
    return this.todos.length;
  }

  // Completed tasks
  get completedTasks(): number {
    return this.todos.filter((todo) => todo.completed).length;
  }

  // Pending tasks
  get pendingTasks(): number {
    return this.todos.filter((todo) => !todo.completed).length;
  }

  // Check overdue
  isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(todo.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }
}
