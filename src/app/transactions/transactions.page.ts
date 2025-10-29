import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect, 
  IonSelectOption 
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { Transaction, CATEGORIES } from '../models/transaction.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class TransactionsPage implements OnInit {
  transactions$: Observable<Transaction[]>;
  isDarkMode = false;
  currentFilter: 'all' | 'income' | 'expense' = 'all';
  showTransactionModal = false;
  transactionType: 'income' | 'expense' = 'income';
  transactionForm: FormGroup;
  categories = CATEGORIES;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private transactionService: TransactionService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.transactions$ = this.transactionService.transactions$;
    
    this.transactionForm = this.formBuilder.group({
      description: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', [Validators.required]],
      date: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Verificar autenticação
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Observar mudanças no tema
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Definir data atual como padrão
    this.transactionForm.patchValue({
      date: new Date().toISOString().split('T')[0]
    });
  }

  getFilteredTransactions(): Transaction[] {
    return this.transactionService.getFilteredTransactions(this.currentFilter);
  }

  setFilter(filter: 'all' | 'income' | 'expense') {
    this.currentFilter = filter;
  }

  openTransactionModal(type: 'income' | 'expense') {
    this.transactionType = type;
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      date: new Date().toISOString().split('T')[0]
    });
    this.showTransactionModal = true;
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
    this.transactionForm.reset();
  }

  async onSubmitTransaction() {
    if (this.transactionForm.valid) {
      this.transactionService.addTransaction(this.transactionForm.value, this.transactionType);
      this.closeTransactionModal();
      this.showToast(`${this.transactionType === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`, 'success');
    } else {
      this.showToast('Por favor, preencha todos os campos corretamente', 'warning');
    }
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getCategoryName(category: string): string {
    return this.categories[category as keyof typeof this.categories] || category;
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
