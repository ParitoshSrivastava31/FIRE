import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';

export interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  targetYear: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: string;
}

export interface OnboardingState {
  // Progress
  step: number;
  totalSteps: number;

  // Step 1 — Personal
  fullName: string;
  dateOfBirth: string;
  city: string;
  occupation: string; // 'salaried' | 'freelancer' | 'business' | 'student'

  // Step 2 — Income & Expenses
  monthlyIncome: string;
  expenses: Expense[];

  // Step 3 — Goals
  selectedGoalTypes: string[];
  goals: Goal[];

  // Step 4 — Risk
  riskAnswers: number[]; // 0–4 per question
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  addRiskAnswer: (answer: number) => void;
  computeRiskProfile: () => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  totalSteps: 10,
  fullName: '',
  dateOfBirth: '',
  city: '',
  occupation: '',
  monthlyIncome: '',
  expenses: [
    { id: 'rent', category: 'Rent / EMI', amount: '' },
    { id: 'food', category: 'Food & Dining', amount: '' },
    { id: 'transport', category: 'Transport', amount: '' },
    { id: 'utilities', category: 'Utilities', amount: '' },
    { id: 'entertainment', category: 'Entertainment', amount: '' },
    { id: 'other', category: 'Other', amount: '' },
  ],
  selectedGoalTypes: [] as string[],
  goals: [] as Goal[],
  riskAnswers: [] as number[],
  riskProfile: null as 'conservative' | 'moderate' | 'aggressive' | null,
};

// Custom async storage that uses Capacitor Preferences on native, localStorage on web
const capacitorStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: name });
      return value;
    }
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: name, value });
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: name });
    } else {
      localStorage.removeItem(name);
    }
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      nextStep: () =>
        set((s) => ({ step: Math.min(s.step + 1, s.totalSteps) })),

      prevStep: () =>
        set((s) => ({ step: Math.max(s.step - 1, 1) })),

      setField: (key, value) => set({ [key]: value } as any),

      updateGoal: (id, data) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      addRiskAnswer: (answer) => {
        const answers = [...get().riskAnswers, answer];
        set({ riskAnswers: answers });

        // Auto-compute profile after 5 answers
        if (answers.length >= 5) {
          const total = answers.reduce((a, b) => a + b, 0);
          const avg = total / answers.length;
          const profile =
            avg < 1.5 ? 'conservative' : avg < 2.8 ? 'moderate' : 'aggressive';
          set({ riskProfile: profile });
        }
      },

      computeRiskProfile: () => {
        const answers = get().riskAnswers;
        if (answers.length === 0) return;
        const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
        const profile =
          avg < 1.5 ? 'conservative' : avg < 2.8 ? 'moderate' : 'aggressive';
        set({ riskProfile: profile });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'monetra-onboarding-v2',
      storage: createJSONStorage(() => capacitorStorage),
    }
  )
);
