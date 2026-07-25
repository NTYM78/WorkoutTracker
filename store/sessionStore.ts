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
  removeExercise: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number, reps: number, weight: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, reps: number, weight: number) => void;
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

  removeExercise: (exerciseIndex) => set((state) => ({
    exercises: state.exercises.filter((_, i) => i !== exerciseIndex),
  })),

  addSet: (exerciseIndex, reps, weight) => set((state) => {
    const exercises = [...state.exercises];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      sets: [...exercises[exerciseIndex].sets, { reps, weight }],
    };
    return { exercises };
  }),

  removeSet: (exerciseIndex, setIndex) => set((state) => {
    const exercises = [...state.exercises];
    const sets = exercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
    return { exercises };
  }),

  updateSet: (exerciseIndex, setIndex, reps, weight) => set((state) => {
    const exercises = [...state.exercises];
    const sets = [...exercises[exerciseIndex].sets];
    sets[setIndex] = { reps, weight };
    exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
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