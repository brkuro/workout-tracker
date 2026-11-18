import { Injectable, signal, effect } from '@angular/core';
import {
  Exercise,
  WorkoutTemplate,
  WorkoutLog,
  ExecutedExercise
} from '../models/workout.model';
import { INITIAL_EXERCISES } from '../data/exercises.seed';

@Injectable({
  providedIn: 'root'
})
export class WorkoutStateService {
  private readonly TEMPLATES_KEY = 'wt_templates_v1';
  private readonly LOGS_KEY = 'wt_logs_v1';
  private readonly EXERCISES_KEY = 'wt_exercises_v1';

  // Signals principais (Estado Reativo)
  readonly exercises = signal<Exercise[]>(this.loadFromStorage(this.EXERCISES_KEY, INITIAL_EXERCISES));
  readonly templates = signal<WorkoutTemplate[]>(this.loadFromStorage(this.TEMPLATES_KEY, []));
  readonly logs = signal<WorkoutLog[]>(this.loadFromStorage(this.LOGS_KEY, []));

  constructor() {
    // Sincronização automática com localStorage sempre que um signal mudar
    effect(() => localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(this.exercises())));
    effect(() => localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(this.templates())));
    effect(() => localStorage.setItem(this.LOGS_KEY, JSON.stringify(this.logs())));
  }

  // --- CRUD de Exercícios ---
  addCustomExercise(name: string, muscleGroup: Exercise['muscleGroup']): Exercise {
    const newExercise: Exercise = {
      id: this.generateSlug(name),
      name: name.trim(),
      muscleGroup
    };
    this.exercises.update(list => [...list, newExercise]);
    return newExercise;
  }

  // --- CRUD de Fichas (Templates) ---
  saveTemplate(template: WorkoutTemplate): void {
    this.templates.update(list => {
      const index = list.findIndex(t => t.id === template.id);
      if (index > -1) {
        const updated = [...list];
        updated[index] = template;
        return updated;
      }
      return [...list, template];
    });
  }

  deleteTemplate(templateId: string): void {
    this.templates.update(list => list.filter(t => t.id !== templateId));
  }

  // --- Registro de Treinos Executados ---
  addWorkoutLog(log: WorkoutLog): void {
    this.logs.update(list => [log, ...list]);
  }

  // Busca o último desempenho de um exercício específico (para pré-preencher cargas!)
  getLastExercisePerformance(exerciseId: string): ExecutedExercise | null {
    // Os logs ficam ordenados do mais recente para o mais antigo
    for (const log of this.logs()) {
      const found = log.exercises.find(ex => ex.exerciseId === exerciseId);
      if (found && found.sets.some(s => s.completed)) {
        return found;
      }
    }
    return null;
  }

  // Utilitário para gerar o identificador ISO da semana (ex: "2026-W47")
  getCurrentWeekIdentifier(date: Date = new Date()): string {
    const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${tempDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private generateSlug(text: string): string {
    return `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
  }
}