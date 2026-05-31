import { create } from 'zustand';
import { Couple, User } from '../types';

interface CoupleStore {
  couple: Couple | null;
  partner: User | null;
  setCouple: (couple: Couple) => void;
  setPartner: (partner: User) => void;
  clearCouple: () => void;
}

export const useCoupleStore = create<CoupleStore>((set) => ({
  couple: null,
  partner: null,
  setCouple: (couple) => set({ couple }),
  setPartner: (partner) => set({ partner }),
  clearCouple: () => set({ couple: null, partner: null }),
}));
