import { Injectable, signal, inject, effect } from '@angular/core';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase.client';
import { AuthService } from './auth.service';
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
  private authService = inject(AuthService);

  readonly exercises = signal<Exercise[]>(INITIAL_EXERCISES);
  readonly templates = signal<WorkoutTemplate[]>([]);
  readonly logs = signal<WorkoutLog[]>([]);

  private unsubscribers: Unsubscribe[] = [];

  constructor() {
    // Reage automaticamente quando o usuário faz login ou logout
    effect(() => {
      const user = this.authService.currentUser();
      this.clearListeners();

      if (user) {
        this.listenToUserFirestore(user.uid);
      } else {
        this.exercises.set(INITIAL_EXERCISES);
        this.templates.set([]);
        this.logs.set([]);
      }
    });
  }

  private clearListeners(): void {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }

  private listenToUserFirestore(uid: string): void {
    // 1. Exercícios customizados do usuário
    const unsubEx = onSnapshot(
      collection(db, `users/${uid}/exercises`),
      snapshot => {
        const merged = [...INITIAL_EXERCISES];
        snapshot.forEach(docSnap => {
          const item = { id: docSnap.id, ...docSnap.data() } as Exercise;
          if (!merged.some(e => e.id === item.id)) {
            merged.push(item);
          }
        });
        this.exercises.set(merged);
      },
      err => console.error('Erro ao ler exercises:', err)
    );

    // 2. Fichas de treino do usuário
    const unsubTpl = onSnapshot(
      collection(db, `users/${uid}/templates`),
      snapshot => {
        const list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as WorkoutTemplate[];
        this.templates.set(list);
      },
      err => console.error('Erro ao ler templates:', err)
    );

    // 3. Histórico de treinos do usuário
    const logsQuery = query(collection(db, `users/${uid}/logs`), orderBy('date', 'desc'));
    const unsubLogs = onSnapshot(
      logsQuery,
      snapshot => {
        const list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as WorkoutLog[];
        this.logs.set(list);
      },
      err => console.error('Erro ao ler logs:', err)
    );

    this.unsubscribers.push(unsubEx, unsubTpl, unsubLogs);
  }

  async addCustomExercise(name: string, muscleGroup: Exercise['muscleGroup']): Promise<Exercise> {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) throw new Error('Usuário não autenticado');

    const newExercise: Exercise = {
      id: this.generateSlug(name),
      name: name.trim(),
      muscleGroup
    };
    await setDoc(doc(db, `users/${uid}/exercises`, newExercise.id), newExercise);
    return newExercise;
  }

  async saveTemplate(template: WorkoutTemplate): Promise<void> {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) return;

    const cleanTemplate: WorkoutTemplate = {
      id: template.id,
      name: template.name,
      description: template.description ?? '',
      exercises: template.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        targetSets: Number(ex.targetSets) || 3,
        targetReps: String(ex.targetReps || '8-12'),
        restSeconds: Number(ex.restSeconds) || 90,
        notes: ex.notes ?? ''
      })),
      createdAt: template.createdAt
    };

    try {
      await setDoc(doc(db, `users/${uid}/templates`, template.id), cleanTemplate);
    } catch (error) {
      console.error('Falha ao salvar ficha no Firestore:', error);
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/templates`, templateId));
  }

  async addWorkoutLog(log: WorkoutLog): Promise<void> {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) return;

    try {
      await setDoc(doc(db, `users/${uid}/logs`, log.id), log);
    } catch (error) {
      console.error('Falha ao salvar treino no Firestore:', error);
    }
  }

  getLastExercisePerformance(exerciseId: string): ExecutedExercise | null {
    for (const log of this.logs()) {
      const found = log.exercises.find(ex => ex.exerciseId === exerciseId);
      if (found && found.sets.some(s => s.completed)) {
        return found;
      }
    }
    return null;
  }

  getCurrentWeekIdentifier(date: Date = new Date()): string {
    const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${tempDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  private generateSlug(text: string): string {
    return `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
  }
}