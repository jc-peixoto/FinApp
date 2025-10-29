import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { 
  IonContent, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class DashboardPage implements OnInit {
  currentUser: string | null = null;
  isDarkMode = false;
  transactions$: Observable<Transaction[]>;
  totalBalance = 0;
  totalIncome = 0;
  totalExpense = 0;
  currentFilter: 'all' | 'income' | 'expense' = 'all';

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.transactions$ = this.transactionService.transactions$;
  }

  ngOnInit() {
    // Verificar autenticação
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();

    // Observar mudanças no tema
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Observar mudanças nas transações
    this.transactions$.subscribe(() => {
      this.updateBalances();
    });

    this.updateBalances();
  }

  updateBalances() {
    this.totalBalance = this.transactionService.getTotalBalance();
    this.totalIncome = this.transactionService.getTotalIncome();
    this.totalExpense = this.transactionService.getTotalExpense();
  }

  getFilteredTransactions(): Transaction[] {
    return this.transactionService.getFilteredTransactions(this.currentFilter);
  }

  setFilter(filter: 'all' | 'income' | 'expense') {
    this.currentFilter = filter;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  navigateToTransactions() {
    this.router.navigate(['/transactions']);
  }

  navigateToInvestments() {
    this.router.navigate(['/investments']);
  }

  navigateToGoals() {
    this.router.navigate(['/goals']);
  }

  formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getCategoryName(category: string): string {
    const categories: { [key: string]: string } = {
      salary: 'Salário',
      freelance: 'Freelance',
      investment: 'Investimento',
      food: 'Alimentação',
      transport: 'Transporte',
      housing: 'Moradia',
      entertainment: 'Entretenimento',
      health: 'Saúde',
      education: 'Educação',
      other: 'Outros'
    };
    return categories[category] || category;
  }

  async deleteTransaction(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta transação?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: () => {
            this.transactionService.deleteTransaction(id);
            this.showToast('Transação excluída com sucesso!', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
