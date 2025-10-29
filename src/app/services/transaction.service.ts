import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction, TransactionForm } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadTransactions();
  }

  addTransaction(form: TransactionForm, type: 'income' | 'expense'): void {
    const transaction: Transaction = {
      id: Date.now(),
      type,
      description: form.description,
      amount: form.amount,
      category: form.category,
      date: form.date,
      createdAt: new Date().toISOString()
    };

    const transactions = this.transactionsSubject.value;
    transactions.unshift(transaction);
    this.transactionsSubject.next(transactions);
    this.saveTransactions();
  }

  deleteTransaction(id: number): void {
    const transactions = this.transactionsSubject.value.filter(t => t.id !== id);
    this.transactionsSubject.next(transactions);
    this.saveTransactions();
  }

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  getFilteredTransactions(filter: 'all' | 'income' | 'expense'): Transaction[] {
    const transactions = this.transactionsSubject.value;
    if (filter === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.type === filter);
  }

  getTotalBalance(): number {
    const transactions = this.transactionsSubject.value;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return totalIncome - totalExpense;
  }

  getTotalIncome(): number {
    return this.transactionsSubject.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.transactionsSubject.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private loadTransactions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_transactions`;
      const transactions = localStorage.getItem(key);
      if (transactions) {
        this.transactionsSubject.next(JSON.parse(transactions));
      } else {
        // Carregar dados de exemplo para novos usuários
        this.loadSampleData();
      }
    }
  }

  private saveTransactions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_transactions`;
      localStorage.setItem(key, JSON.stringify(this.transactionsSubject.value));
    }
  }

  private loadSampleData(): void {
    const sampleData: Transaction[] = [
      {
        id: 1,
        type: 'income',
        description: 'Salário',
        amount: 3500.00,
        category: 'salary',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'expense',
        description: 'Aluguel',
        amount: 1200.00,
        category: 'housing',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        type: 'expense',
        description: 'Supermercado',
        amount: 450.00,
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        type: 'income',
        description: 'Freelance',
        amount: 800.00,
        category: 'freelance',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ];

    this.transactionsSubject.next(sampleData);
    this.saveTransactions();
  }
}
