import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  private readonly DARK_MODE_KEY = 'finapp_darkMode';

  constructor() {
    this.loadTheme();
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkModeSubject.value;
    const newMode = !currentMode;
    
    this.isDarkModeSubject.next(newMode);
    this.saveTheme(newMode);
    this.applyTheme(newMode);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.saveTheme(isDark);
    this.applyTheme(isDark);
  }

  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.DARK_MODE_KEY);
    const isDark = savedTheme === 'true';
    
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
  }

  private saveTheme(isDark: boolean): void {
    localStorage.setItem(this.DARK_MODE_KEY, isDark.toString());
  }

  private applyTheme(isDark: boolean): void {
    document.body.classList.toggle('dark', isDark);
  }
}
