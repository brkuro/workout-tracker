import { Injectable, inject } from '@angular/core';
import { WorkoutStateService } from './workout-state.service';
import {
  MuscleGroup,
  WeeklyMuscleVolume,
  StrengthProgressPoint
} from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutAnalyticsService {
  private state = inject(WorkoutStateService);

  private readonly ALL_MUSCLE_GROUPS: MuscleGroup[] = [
    'Peito', 'Costas', 'Quadríceps', 'Posterior',
    'Ombros', 'Bíceps', 'Tríceps', 'Panturrilha', 'Abdômen'
  ];

  // 1. Calcula séries válidas e tonelagem por grupo muscular na semana escolhida
  getWeeklyVolumeByMuscle(weekIdentifier: string): WeeklyMuscleVolume[] {
    const weekLogs = this.state.logs().filter(log => log.weekIdentifier === weekIdentifier);

    const volumeMap = new Map<MuscleGroup, { validSets: number; totalTonnage: number }>();
    this.ALL_MUSCLE_GROUPS.forEach(group => {
      volumeMap.set(group, { validSets: 0, totalTonnage: 0 });
    });

    for (const log of weekLogs) {
      for (const exercise of log.exercises) {
        const current = volumeMap.get(exercise.muscleGroup)!;
        const completedSets = exercise.sets.filter(s => s.completed);

        current.validSets += completedSets.length;
        current.totalTonnage += completedSets.reduce(
          (acc, set) => acc + (set.reps * set.weight),
          0
        );
      }
    }

    return Array.from(volumeMap.entries()).map(([muscleGroup, stats]) => ({
      muscleGroup,
      validSets: stats.validSets,
      totalTonnage: stats.totalTonnage
    }));
  }

  // 2. Calcula a evolução de força (1RM Estimada via Epley) de um exercício ao longo do tempo
  getExerciseStrengthProgression(exerciseId: string): StrengthProgressPoint[] {
    // Ordena cronologicamente (do mais antigo para o mais recente) para o gráfico de linha
    const chronologicalLogs = [...this.state.logs()].reverse();
    const points: StrengthProgressPoint[] = [];

    for (const log of chronologicalLogs) {
      const exercise = log.exercises.find(ex => ex.exerciseId === exerciseId);
      if (!exercise) continue;

      const completedSets = exercise.sets.filter(s => s.completed && s.weight > 0);
      if (completedSets.length === 0) continue;

      let best1RM = 0;
      let maxWeight = 0;
      let bestSetLabel = '';

      for (const set of completedSets) {
        // Fórmula de Epley: 1RM = peso * (1 + reps / 30)
        const estimated1RM = set.reps === 1
          ? set.weight
          : Number((set.weight * (1 + set.reps / 30)).toFixed(1));

        if (estimated1RM > best1RM) {
          best1RM = estimated1RM;
          bestSetLabel = `${set.weight}kg x ${set.reps}`;
        }
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      }

      points.push({
        date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        maxWeight,
        estimated1RM: best1RM,
        bestSetLabel
      });
    }

    return points;
  }
}