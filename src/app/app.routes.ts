import { Routes } from '@angular/router';
import { WorkoutBuilderComponent } from './features/workout-builder/workout-builder';
import { ActiveSessionComponent } from './features/active-session/active-session';

export const routes: Routes = [
  { path: '', redirectTo: 'fichas', pathMatch: 'full' },
  { path: 'fichas', component: WorkoutBuilderComponent },
  { path: 'treinar', component: ActiveSessionComponent }
];