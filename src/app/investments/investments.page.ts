import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonInput 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { InvestmentService } from '../services/investment.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { Stock, PortfolioItem, PortfolioForm } from '../models/investment.model';

@Component({
  selector: 'app-investments',
  templateUrl: './investments.page.html',
  styleUrls: ['./investments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput
  ]
})
export class InvestmentsPage implements OnInit {
  isDarkMode = false;
  currentTab: 'favorites' | 'popular' | 'portfolio' = 'favorites';
  searchQuery = '';
  
  popularStocks$: Observable<Stock[]>;
  favorites$: Observable<string[]>;
  portfolio$: Observable<PortfolioItem[]>;
  
  showPortfolioModal = false;
  currentStockForPortfolio: Stock | null = null;
  portfolioForm: FormGroup;
  
  portfolioSummary = { totalInvested: 0, currentValue: 0, totalProfit: 0 };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private investmentService: InvestmentService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.popularStocks$ = this.investmentService.popularStocks$;
    this.favorites$ = this.investmentService.favorites$;
    this.portfolio$ = this.investmentService.portfolio$;
    
    this.portfolioForm = this.formBuilder.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      averagePrice: ['', [Validators.required, Validators.min(0.01)]]
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

    // Observar mudanças no portfólio
    this.portfolio$.subscribe(() => {
      this.updatePortfolioSummary();
    });

    this.updatePortfolioSummary();
  }

  setTab(tab: 'favorites' | 'popular' | 'portfolio') {
    this.currentTab = tab;
    this.searchQuery = '';
  }

  getFilteredStocks(): Stock[] {
    const stocks = this.currentTab === 'favorites' 
      ? this.getFavoriteStocks() 
      : this.investmentService.getPopularStocks();
    
    if (!this.searchQuery) return stocks;
    
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getFavoriteStocks(): Stock[] {
    const favorites = this.investmentService.getFavorites();
    return this.investmentService.getPopularStocks().filter(stock => 
      favorites.includes(stock.symbol)
    );
  }

  getPortfolioItems(): PortfolioItem[] {
    return this.investmentService.getPortfolio();
  }

  toggleFavorite(symbol: string) {
    this.investmentService.toggleFavorite(symbol);
    const isFavorite = this.investmentService.getFavorites().includes(symbol);
    this.showToast(
      `${symbol} ${isFavorite ? 'adicionado aos' : 'removido dos'} favoritos`,
      'success'
    );
  }

  openPortfolioModal(stock: Stock) {
    this.currentStockForPortfolio = stock;
    const existingItem = this.investmentService.getPortfolio().find(item => item.symbol === stock.symbol);
    
    if (existingItem) {
      this.portfolioForm.patchValue({
        quantity: existingItem.quantity,
        averagePrice: existingItem.averagePrice
      });
    } else {
      this.portfolioForm.patchValue({
        quantity: 1,
        averagePrice: stock.price
      });
    }
    
    this.showPortfolioModal = true;
  }

  closePortfolioModal() {
    this.showPortfolioModal = false;
    this.currentStockForPortfolio = null;
    this.portfolioForm.reset();
  }

  async onSubmitPortfolio() {
    if (this.portfolioForm.valid && this.currentStockForPortfolio) {
      const formValue: PortfolioForm = this.portfolioForm.value;
      this.investmentService.addToPortfolio(this.currentStockForPortfolio.symbol, formValue);
      this.closePortfolioModal();
      this.showToast(`${this.currentStockForPortfolio.symbol} adicionado ao portfólio`, 'success');
    }
  }

  async removeFromPortfolio(symbol: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Remoção',
      message: `Tem certeza que deseja remover ${symbol} do seu portfólio?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            this.investmentService.removeFromPortfolio(symbol);
            this.showToast(`${symbol} removido do portfólio`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  increaseQuantity() {
    const currentValue = this.portfolioForm.get('quantity')?.value || 1;
    this.portfolioForm.patchValue({ quantity: currentValue + 1 });
  }

  decreaseQuantity() {
    const currentValue = this.portfolioForm.get('quantity')?.value || 1;
    if (currentValue > 1) {
      this.portfolioForm.patchValue({ quantity: currentValue - 1 });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2).replace('.', ',')}%`;
  }

  isFavorite(symbol: string): boolean {
    return this.investmentService.getFavorites().includes(symbol);
  }

  isInPortfolio(symbol: string): boolean {
    return this.investmentService.getPortfolio().some(item => item.symbol === symbol);
  }

  private updatePortfolioSummary() {
    this.portfolioSummary = this.investmentService.getPortfolioSummary();
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
