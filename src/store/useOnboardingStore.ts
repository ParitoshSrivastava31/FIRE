import { create } from 'zustand'

export interface OnboardingState {
  step: number
  personalInfo: {
    fullName: string
    dateOfBirth: string
    city: string
    occupation: string
  }
  incomeExpenses: {
    monthlyIncome: string
    expenses: Array<{ id: string, category: string, amount: string }>
  }
  goals: Array<{ id: string, name: string, targetAmount: string, targetYear: string }>
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | null
  setStep: (step: number) => void
  updatePersonalInfo: (data: Partial<OnboardingState['personalInfo']>) => void
  updateIncomeExpenses: (data: Partial<OnboardingState['incomeExpenses']>) => void
  setRiskProfile: (profile: OnboardingState['riskProfile']) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  personalInfo: {
    fullName: '',
    dateOfBirth: '',
    city: '',
    occupation: ''
  },
  incomeExpenses: {
    monthlyIncome: '',
    expenses: []
  },
  goals: [],
  riskProfile: null,
  setStep: (step) => set({ step }),
  updatePersonalInfo: (data) => set((state) => ({ personalInfo: { ...state.personalInfo, ...data } })),
  updateIncomeExpenses: (data) => set((state) => ({ incomeExpenses: { ...state.incomeExpenses, ...data } })),
  setRiskProfile: (profile) => set({ riskProfile: profile }),
}))
