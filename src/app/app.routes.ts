import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Archive } from './archive/archive';

export const routes: Routes = [
  { path: '',        component: Dashboard },
  { path: 'archive', component: Archive  },
];