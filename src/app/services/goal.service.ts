import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal, GoalForm, AddMoneyForm } from '../models/goal.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  public goals$ = this.goalsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadGoals();
  }

  getGoals(): Goal[] {
    return this.goalsSubject.value;
  }

  addGoal(form: GoalForm): void {
    const goal: Goal = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      target: form.target,
      current: 0,
      image: form.image ? URL.createObjectURL(form.image) : undefined,
      createdAt: new Date().toISOString()
    };

    const goals = this.goalsSubject.value;
    goals.push(goal);
    this.goalsSubject.next(goals);
    this.saveGoals();
  }

  updateGoal(id: number, form: GoalForm): void {
    const goals = this.goalsSubject.value;
    const index = goals.findIndex(g => g.id === id);
    
    if (index > -1) {
      goals[index] = {
        ...goals[index],
        title: form.title,
        description: form.description,
        target: form.target,
        image: form.image ? URL.createObjectURL(form.image) : goals[index].image
      };
      
      this.goalsSubject.next(goals);
      this.saveGoals();
    }
  }

  deleteGoal(id: number): void {
    const goals = this.goalsSubject.value.filter(g => g.id !== id);
    this.goalsSubject.next(goals);
    this.saveGoals();
  }

  addMoneyToGoal(id: number, form: AddMoneyForm): void {
    const goals = this.goalsSubject.value;
    const index = goals.findIndex(g => g.id === id);
    
    if (index > -1) {
      goals[index].current += form.amount;
      this.goalsSubject.next(goals);
      this.saveGoals();
    }
  }

  getGoalProgress(id: number): number {
    const goal = this.goalsSubject.value.find(g => g.id === id);
    if (!goal) return 0;
    return Math.min((goal.current / goal.target) * 100, 100);
  }

  isGoalCompleted(id: number): boolean {
    const goal = this.goalsSubject.value.find(g => g.id === id);
    if (!goal) return false;
    return goal.current >= goal.target;
  }

  private loadGoals(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_goals`;
      const goals = localStorage.getItem(key);
      if (goals) {
        this.goalsSubject.next(JSON.parse(goals));
      }
    }
  }

  private saveGoals(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_goals`;
      localStorage.setItem(key, JSON.stringify(this.goalsSubject.value));
    }
  }
}
