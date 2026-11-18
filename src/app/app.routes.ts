import { Routes } from '@angular/router';
import { WorkoutBuilderComponent } from './features/workout-builder/workout-builder';

export const routes: Routes = [
  { path: '', redirectTo: 'fichas', pathMatch: 'full' },
  { path: 'fichas', component: WorkoutBuilderComponent }
];