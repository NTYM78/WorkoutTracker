import { create } from 'zustand';

interface Set {
  reps: number;
  weight: number;
}

interface Exercise {
  name: string;
  sets: Set[];
}

interface SessionStore {
  isActive: boolean;
  workoutName: string;
  notes: string;
  exercises: Exercise[];

  startSession: (name: string) => void;
  addExercise: (name: string) => void;
  addSet: (exerciseIndex: number, reps: number, weight: number) => void;
  setNotes: (notes: string) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  isActive: false,
  workoutName: '',
  notes: '',
  exercises: [],

  startSession: (name) => set({
    isActive: true,
    workoutName: name,
    notes: '',
    exercises: [],
  }),

  addExercise: (name) => set((state) => ({
    exercises: [...state.exercises, { name, sets: [] }],
  })),

  addSet: (exerciseIndex, reps, weight) => set((state) => {
    const exercises = [...state.exercises];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      sets: [...exercises[exerciseIndex].sets, { reps, weight }],
    };
    return { exercises };
  }),

  setNotes: (notes) => set({ notes }),

  endSession: () => set({
    isActive: false,
    workoutName: '',
    notes: '',
    exercises: [],
  }),
}));