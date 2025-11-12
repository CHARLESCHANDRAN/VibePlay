import { create } from 'zustand';

export const useStore = create((set)=>({
  mood: 'neutral', // 'happy'|'sad'|'angry'|'surprised'|'neutral'|'tired'
  confidence: 0,
  energy: 50, // 0..100
  valence: 0, // -100..100
  intent: null, // 'keep'|'shift'
  setMood: (mood,confidence=1)=> set({ mood, confidence }),
  setEnergy: (energy)=> set({ energy }),
  setValence: (valence)=> set({ valence }),
  setIntent: (intent)=> set({ intent })
}));
