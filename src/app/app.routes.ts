import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/transactions.page').then(m => m.TransactionsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'investments',
    loadComponent: () => import('./investments/investments.page').then(m => m.InvestmentsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'goals',
    loadComponent: () => import('./goals/goals.page').then(m => m.GoalsPage),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];