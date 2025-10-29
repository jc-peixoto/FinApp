import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  addOutline, 
  removeOutline, 
  receiptOutline, 
  trashOutline, 
  closeOutline, 
  eyeOutline, 
  flagOutline,
  homeOutline,
  walletOutline,
  trendingUpOutline,
  personOutline,
  settingsOutline,
  logOutOutline,
  chevronForwardOutline,
  calendarOutline,
  timeOutline,
  checkmarkOutline,
  alertOutline,
  informationOutline,
  warningOutline,
  starOutline,
  flameOutline,
  briefcaseOutline,
  searchOutline,
  cashOutline,
  analyticsOutline,
  createOutline,
  arrowUpOutline,
  arrowDownOutline,
  lockClosedOutline,
  logInOutline,
  personAddOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Registrar os ícones
addIcons({
  'arrow-back': arrowBackOutline,
  'add': addOutline,
  'remove': removeOutline,
  'receipt': receiptOutline,
  'trash': trashOutline,
  'close': closeOutline,
  'eye': eyeOutline,
  'flag': flagOutline,
  'home': homeOutline,
  'wallet': walletOutline,
  'trending-up': trendingUpOutline,
  'person': personOutline,
  'settings': settingsOutline,
  'log-out': logOutOutline,
  'chevron-forward': chevronForwardOutline,
  'calendar': calendarOutline,
  'time': timeOutline,
  'checkmark': checkmarkOutline,
  'alert': alertOutline,
  'information': informationOutline,
  'warning': warningOutline,
  'star': starOutline,
  'flame': flameOutline,
  'briefcase': briefcaseOutline,
  'search': searchOutline,
  'cash': cashOutline,
  'analytics': analyticsOutline,
  'create': createOutline,
  'arrow-up': arrowUpOutline,
  'arrow-down': arrowDownOutline,
  'lock-closed': lockClosedOutline,
  'log-in': logInOutline,
  'person-add': personAddOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
