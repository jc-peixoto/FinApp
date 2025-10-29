import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Stock, PortfolioItem, PortfolioForm, POPULAR_STOCKS } from '../models/investment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  private portfolioSubject = new BehaviorSubject<PortfolioItem[]>([]);
  private popularStocksSubject = new BehaviorSubject<Stock[]>(POPULAR_STOCKS);

  public favorites$ = this.favoritesSubject.asObservable();
  public portfolio$ = this.portfolioSubject.asObservable();
  public popularStocks$ = this.popularStocksSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadData();
    this.simulateRealTimeUpdates();
  }

  getPopularStocks(): Stock[] {
    return this.popularStocksSubject.value;
  }

  getFavorites(): string[] {
    return this.favoritesSubject.value;
  }

  getPortfolio(): PortfolioItem[] {
    return this.portfolioSubject.value;
  }

  toggleFavorite(symbol: string): void {
    const favorites = this.favoritesSubject.value;
    const index = favorites.indexOf(symbol);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(symbol);
    }
    
    this.favoritesSubject.next(favorites);
    this.saveFavorites();
  }

  addToPortfolio(symbol: string, form: PortfolioForm): void {
    const stock = this.findStock(symbol);
    if (!stock) return;

    const portfolioItem: PortfolioItem = {
      symbol,
      name: stock.name,
      quantity: form.quantity,
      averagePrice: form.averagePrice,
      currentPrice: stock.price,
      totalInvested: form.quantity * form.averagePrice,
      currentValue: form.quantity * stock.price,
      profit: (form.quantity * stock.price) - (form.quantity * form.averagePrice),
      profitPercent: ((stock.price - form.averagePrice) / form.averagePrice) * 100
    };

    const portfolio = this.portfolioSubject.value;
    const existingIndex = portfolio.findIndex(item => item.symbol === symbol);
    
    if (existingIndex > -1) {
      portfolio[existingIndex] = portfolioItem;
    } else {
      portfolio.push(portfolioItem);
    }
    
    this.portfolioSubject.next(portfolio);
    this.savePortfolio();
  }

  removeFromPortfolio(symbol: string): void {
    const portfolio = this.portfolioSubject.value.filter(item => item.symbol !== symbol);
    this.portfolioSubject.next(portfolio);
    this.savePortfolio();
  }

  getPortfolioSummary(): { totalInvested: number; currentValue: number; totalProfit: number } {
    const portfolio = this.portfolioSubject.value;
    const totalInvested = portfolio.reduce((sum, item) => sum + item.totalInvested, 0);
    const currentValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
    const totalProfit = currentValue - totalInvested;
    
    return { totalInvested, currentValue, totalProfit };
  }

  searchStocks(query: string): Stock[] {
    const stocks = this.popularStocksSubject.value;
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  private findStock(symbol: string): Stock | undefined {
    return this.popularStocksSubject.value.find(stock => stock.symbol === symbol);
  }

  private loadData(): void {
    this.loadFavorites();
    this.loadPortfolio();
  }

  private loadFavorites(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_favorites`;
      const favorites = localStorage.getItem(key);
      if (favorites) {
        this.favoritesSubject.next(JSON.parse(favorites));
      }
    }
  }

  private loadPortfolio(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_portfolio`;
      const portfolio = localStorage.getItem(key);
      if (portfolio) {
        this.portfolioSubject.next(JSON.parse(portfolio));
      }
    }
  }

  private saveFavorites(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_favorites`;
      localStorage.setItem(key, JSON.stringify(this.favoritesSubject.value));
    }
  }

  private savePortfolio(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const key = `finapp_${currentUser}_portfolio`;
      localStorage.setItem(key, JSON.stringify(this.portfolioSubject.value));
    }
  }

  private simulateRealTimeUpdates(): void {
    setInterval(() => {
      const stocks = this.popularStocksSubject.value.map(stock => ({
        ...stock,
        price: Math.max(0.01, stock.price + (Math.random() - 0.5) * 2),
        change: (Math.random() - 0.5) * 4,
        changePercent: (Math.random() - 0.5) * 10
      }));
      
      this.popularStocksSubject.next(stocks);
      
      // Atualizar portfólio com novos preços
      const portfolio = this.portfolioSubject.value.map(item => {
        const stock = stocks.find(s => s.symbol === item.symbol);
        if (stock) {
          return {
            ...item,
            currentPrice: stock.price,
            currentValue: item.quantity * stock.price,
            profit: (item.quantity * stock.price) - item.totalInvested,
            profitPercent: ((stock.price - item.averagePrice) / item.averagePrice) * 100
          };
        }
        return item;
      });
      
      this.portfolioSubject.next(portfolio);
    }, 30000); // Atualizar a cada 30 segundos
  }
}
