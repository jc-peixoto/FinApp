import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonInput 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isDarkMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Verificar se já está logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Criar usuário admin padrão
    this.authService.createDefaultAdmin();

    // Observar mudanças no tema
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Fazendo login...'
      });
      await loading.present();

      const success = this.authService.login(this.loginForm.value);
      
      await loading.dismiss();

      if (success) {
        this.showToast('Login realizado com sucesso!', 'success');
        this.router.navigate(['/dashboard']);
      } else {
        this.showToast('Usuário ou senha incorretos', 'danger');
      }
    } else {
      this.showToast('Por favor, preencha todos os campos', 'warning');
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { username, password, confirmPassword } = this.registerForm.value;
      
      if (password !== confirmPassword) {
        this.showToast('As senhas não coincidem', 'warning');
        return;
      }

      const loading = await this.loadingController.create({
        message: 'Criando conta...'
      });
      await loading.present();

      const success = this.authService.register({
        username,
        password,
        confirmPassword
      });
      
      await loading.dismiss();

      if (success) {
        this.showToast('Conta criada com sucesso!', 'success');
        this.switchToLogin();
        this.registerForm.reset();
      } else {
        this.showToast('Este usuário já existe', 'danger');
      }
    } else {
      this.showToast('Por favor, preencha todos os campos corretamente', 'warning');
    }
  }

  switchToRegister() {
    this.isLoginMode = false;
    this.loginForm.reset();
  }

  switchToLogin() {
    this.isLoginMode = true;
    this.registerForm.reset();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
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
