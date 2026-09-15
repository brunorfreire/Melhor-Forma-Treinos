export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  rest: string;
  weight?: string;
  notes?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  muscleWikiUrl?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  studentName: string;
  trainerName: string;
  trainerPhone?: string;
  goal: string;
  frequency: string;
  generalNotes: string;
  sessions: WorkoutSession[];
  createdAt: string;
  updatedAt?: string;
}

export type ViewMode = 'editor' | 'student' | 'share';
