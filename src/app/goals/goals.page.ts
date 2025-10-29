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
  IonInput,
  IonTextarea 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { GoalService } from '../services/goal.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { Goal, GoalForm, AddMoneyForm } from '../models/goal.model';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
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
    IonTextarea
  ]
})
export class GoalsPage implements OnInit {
  isDarkMode = false;
  goals$: Observable<Goal[]>;
  
  showAddGoalModal = false;
  showAddMoneyModal = false;
  currentGoalForMoney: Goal | null = null;
  
  goalForm: FormGroup;
  addMoneyForm: FormGroup;
  
  selectedImage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private goalService: GoalService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.goals$ = this.goalService.goals$;
    
    this.goalForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: [''],
      target: ['', [Validators.required, Validators.min(0.01)]]
    });
    
    this.addMoneyForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]]
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
  }

  getGoals(): Goal[] {
    return this.goalService.getGoals();
  }

  openAddGoalModal() {
    this.resetGoalForm();
    this.showAddGoalModal = true;
  }

  closeAddGoalModal() {
    this.showAddGoalModal = false;
    this.resetGoalForm();
  }

  openAddMoneyModal(goal: Goal) {
    this.currentGoalForMoney = goal;
    this.addMoneyForm.reset();
    this.showAddMoneyModal = true;
  }

  closeAddMoneyModal() {
    this.showAddMoneyModal = false;
    this.currentGoalForMoney = null;
    this.addMoneyForm.reset();
  }

  async onSubmitGoal() {
    if (this.goalForm.valid) {
      const formValue: GoalForm = {
        ...this.goalForm.value,
        image: this.selectedFile || undefined
      };
      
      this.goalService.addGoal(formValue);
      this.closeAddGoalModal();
      this.showToast('Meta criada com sucesso!', 'success');
    } else {
      this.showToast('Por favor, preencha todos os campos corretamente', 'warning');
    }
  }

  async onSubmitAddMoney() {
    if (this.addMoneyForm.valid && this.currentGoalForMoney) {
      const formValue: AddMoneyForm = this.addMoneyForm.value;
      this.goalService.addMoneyToGoal(this.currentGoalForMoney.id, formValue);
      this.closeAddMoneyModal();
      this.showToast(`R$ ${formValue.amount.toFixed(2).replace('.', ',')} adicionado à meta "${this.currentGoalForMoney.title}"`, 'success');
    }
  }

  async deleteGoal(goal: Goal) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a meta "${goal.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: () => {
            this.goalService.deleteGoal(goal.id);
            this.showToast(`Meta "${goal.title}" excluída com sucesso!`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.selectedFile = null;
    const fileInput = document.getElementById('goalImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getGoalProgress(goal: Goal): number {
    return this.goalService.getGoalProgress(goal.id);
  }

  isGoalCompleted(goal: Goal): boolean {
    return this.goalService.isGoalCompleted(goal.id);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  private resetGoalForm() {
    this.goalForm.reset();
    this.selectedImage = null;
    this.selectedFile = null;
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
