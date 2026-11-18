export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Quadríceps'
  | 'Posterior'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Panturrilha'
  | 'Abdômen';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: PlannedExercise[];
  createdAt: string;
}

export interface ExecutedSet {
  setNumber: number;
  reps: number;
  weight: number; // em kg
  rpe?: number;
  completed: boolean;
}

export interface ExecutedExercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: ExecutedSet[];
}

export interface WorkoutLog {
  id: string;
  workoutTemplateId: string;
  workoutName: string;
  date: string;           // ISO String: "2026-11-18T17:30:00.000Z"
  weekIdentifier: string; // Ex: "2026-W47"
  durationMinutes: number;
  exercises: ExecutedExercise[];
}

// Modelos auxiliares para os gráficos
export interface WeeklyMuscleVolume {
  muscleGroup: MuscleGroup;
  validSets: number;
  totalTonnage: number;
}

export interface StrengthProgressPoint {
  date: string;
  maxWeight: number;
  estimated1RM: number;
  bestSetLabel: string; // Ex: "85kg x 8"
}