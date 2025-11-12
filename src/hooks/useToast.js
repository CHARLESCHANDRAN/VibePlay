import { create } from 'zustand';

export const useToast = create((set) => ({
  visible: false,
  message: '',
  type: 'error',
  
  showToast: (message, type = 'error') => {
    set({ visible: true, message, type });
  },
  
  hideToast: () => {
    set({ visible: false });
  },
}));
