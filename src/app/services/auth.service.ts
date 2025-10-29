import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginCredentials, RegisterData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly USERS_KEY = 'finapp_users';
  private readonly CURRENT_USER_KEY = 'finapp_currentUser';

  constructor() {
    // Verificar se há usuário logado
    const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (currentUser) {
      this.currentUserSubject.next(currentUser);
    }
  }

  login(credentials: LoginCredentials): boolean {
    const users = this.getUsers();
    
    if (users[credentials.username] && users[credentials.username].password === credentials.password) {
      localStorage.setItem(this.CURRENT_USER_KEY, credentials.username);
      this.currentUserSubject.next(credentials.username);
      return true;
    }
    
    return false;
  }

  register(data: RegisterData): boolean {
    const users = this.getUsers();
    
    if (users[data.username]) {
      return false; // Usuário já existe
    }
    
    users[data.username] = {
      username: data.username,
      password: data.password,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  private getUsers(): { [key: string]: User } {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : {};
  }

  // Criar usuário admin padrão
  createDefaultAdmin(): void {
    const users = this.getUsers();
    if (!users['admin']) {
      users['admin'] = {
        username: 'admin',
        password: 'admin123',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }
}
