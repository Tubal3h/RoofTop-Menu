import { Routes } from '@angular/router';
import { Menu } from '@app/features/menu/menu';
export const routes: Routes = [
    {
    path: '', // La rotta di default (homepage)
    component: Menu // Carica il nostro menu
  }
];
