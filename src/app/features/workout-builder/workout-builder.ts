import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutStateService } from '../../core/services/workout-state.service';
import {
  Exercise,
  MuscleGroup,
  PlannedExercise,
  WorkoutTemplate
} from '../../core/models/workout.model';

@Component({
  selector: 'app-workout-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-builder.html'
})
export class WorkoutBuilderComponent {
  state = inject(WorkoutStateService);

  // Estado do formulário da Ficha
  editingId = signal<string | null>(null);
  workoutName = signal('');
  workoutDescription = signal('');
  plannedExercises = signal<PlannedExercise[]>([]);

  // Filtro e seleção de exercício
  selectedExerciseId = signal('');
  selectedMuscleFilter = signal<MuscleGroup | 'Todos'>('Todos');

  // Modal/Formulário rápido de novo exercício customizado
  showNewExerciseForm = signal(false);
  newExerciseName = signal('');
  newExerciseMuscle = signal<MuscleGroup>('Peito');

  readonly muscleGroups: MuscleGroup[] = [
    'Peito', 'Costas', 'Quadríceps', 'Posterior',
    'Ombros', 'Bíceps', 'Tríceps', 'Panturrilha', 'Abdômen'
  ];

  // Retorna exercícios filtrados pelo grupo muscular escolhido
  get filteredExercises(): Exercise[] {
    const filter = this.selectedMuscleFilter();
    const all = this.state.exercises();
    return filter === 'Todos' ? all : all.filter(e => e.muscleGroup === filter);
  }

  addExerciseToWorkout(): void {
    const id = this.selectedExerciseId();
    if (!id) return;

    const exercise = this.state.exercises().find(e => e.id === id);
    if (!exercise) return;

    const newItem: PlannedExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      targetSets: 4,
      targetReps: '8-12',
      restSeconds: 90,
      notes: ''
    };

    this.plannedExercises.update(list => [...list, newItem]);
    this.selectedExerciseId.set('');
  }

  removeExercise(index: number): void {
    this.plannedExercises.update(list => list.filter((_, i) => i !== index));
  }

  async createCustomExercise(): Promise<void> {
    const name = this.newExerciseName().trim();
    if (!name) return;

    const created = await this.state.addCustomExercise(name, this.newExerciseMuscle());
    this.selectedExerciseId.set(created.id);
    this.newExerciseName.set('');
    this.showNewExerciseForm.set(false);
  }

  async saveWorkout(): Promise<void> {
    const name = this.workoutName().trim();
    if (!name || this.plannedExercises().length === 0) return;

    const template: WorkoutTemplate = {
      id: this.editingId() ?? `workout-${Date.now()}`,
      name,
      description: this.workoutDescription().trim(),
      exercises: this.plannedExercises(),
      createdAt: new Date().toISOString()
    };

    await this.state.saveTemplate(template);
    this.resetForm();
  }

  editTemplate(template: WorkoutTemplate): void {
    this.editingId.set(template.id);
    this.workoutName.set(template.name);
    this.workoutDescription.set(template.description ?? '');
    // Clona o array para não mutar o signal antes de salvar
    this.plannedExercises.set(template.exercises.map(ex => ({ ...ex })));
  }

  resetForm(): void {
    this.editingId.set(null);
    this.workoutName.set('');
    this.workoutDescription.set('');
    this.plannedExercises.set([]);
  }
}