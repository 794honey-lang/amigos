import { useUiStore } from '../../store/uiStore';

export const useToast = () => {
  const addToast = useUiStore((state) => state.addToast);
  
  const toast = (message, type = 'success') => {
    addToast(message, type);
  };

  return { toast };
};

export default useToast;
