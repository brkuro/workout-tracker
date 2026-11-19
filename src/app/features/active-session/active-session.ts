import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutStateService } from '../../core/services/workout-state.service';
import {
  WorkoutTemplate,
  ExecutedExercise,
  ExecutedSet,
  WorkoutLog
} from '../../core/models/workout.model';

interface ActiveExerciseSession extends ExecutedExercise {
  targetReps: string;
  restSeconds: number;
  lastSessionHint: string | null;
}

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './active-session.html'
})
export class ActiveSessionComponent implements OnDestroy {
  state = inject(WorkoutStateService);
  private router = inject(Router);

  // Estado da sessão
  selectedTemplate = signal<WorkoutTemplate | null>(null);
  activeExercises = signal<ActiveExerciseSession[]>([]);
  startTime = signal<number>(0);

  // Cronômetro de descanso
  restRemaining = signal<number>(0);
  restTotal = signal<number>(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  startWorkout(template: WorkoutTemplate): void {
    this.selectedTemplate.set(template);
    this.startTime.set(Date.now());

    const initializedExercises: ActiveExerciseSession[] = template.exercises.map(planned => {
      const lastPerf = this.state.getLastExercisePerformance(planned.exerciseId);
      const sets: ExecutedSet[] = [];

      for (let i = 0; i < planned.targetSets; i++) {
        // Puxa a carga/reps da mesma série no último treino, ou da última série feita
        const refSet = lastPerf?.sets[i] ?? lastPerf?.sets[lastPerf.sets.length - 1];
        sets.push({
          setNumber: i + 1,
          weight: refSet ? refSet.weight : 0,
          reps: refSet ? refSet.reps : 10,
          completed: false
        });
      }

      const bestLastSet = lastPerf?.sets.reduce(
        (prev, curr) => (curr.weight > prev.weight ? curr : prev),
        lastPerf.sets[0]
      );

      return {
        exerciseId: planned.exerciseId,
        name: planned.name,
        muscleGroup: planned.muscleGroup,
        targetReps: planned.targetReps,
        restSeconds: planned.restSeconds,
        lastSessionHint: bestLastSet ? `${bestLastSet.weight}kg x ${bestLastSet.reps}` : null,
        sets
      };
    });

    this.activeExercises.set(initializedExercises);
  }

  toggleSetCompleted(exercise: ActiveExerciseSession, set: ExecutedSet): void {
    set.completed = !set.completed;
    // Dispara o cronômetro automaticamente ao concluir uma série
    if (set.completed && exercise.restSeconds > 0) {
      this.startRestTimer(exercise.restSeconds);
    }
  }

  addExtraSet(exercise: ActiveExerciseSession): void {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      completed: false
    });
  }

  startRestTimer(seconds: number): void {
    this.clearRestTimer();
    this.restTotal.set(seconds);
    this.restRemaining.set(seconds);

    this.timerInterval = setInterval(() => {
      this.restRemaining.update(val => {
        if (val <= 1) {
          this.clearRestTimer();
          return 0;
        }
        return val - 1;
      });
    }, 1000);
  }

  adjustRestTimer(delta: number): void {
    this.restRemaining.update(val => Math.max(0, val + delta));
    if (this.restRemaining() === 0) {
      this.clearRestTimer();
    }
  }

  clearRestTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.restRemaining.set(0);
  }

  formatSeconds(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  finishWorkout(): void {
    const template = this.selectedTemplate();
    if (!template) return;

    const now = new Date();
    const durationMinutes = Math.max(1, Math.round((Date.now() - this.startTime()) / 60000));

    const log: WorkoutLog = {
      id: `log-${Date.now()}`,
      workoutTemplateId: template.id,
      workoutName: template.name,
      date: now.toISOString(),
      weekIdentifier: this.state.getCurrentWeekIdentifier(now),
      durationMinutes,
      exercises: this.activeExercises().map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets
      }))
    };

    this.state.addWorkoutLog(log);
    this.clearRestTimer();
    this.selectedTemplate.set(null);
    this.router.navigate(['/dashboard']);
  }

  cancelWorkout(): void {
    this.clearRestTimer();
    this.selectedTemplate.set(null);
  }

  ngOnDestroy(): void {
    this.clearRestTimer();
  }
}