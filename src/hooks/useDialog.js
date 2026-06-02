import { useDialog as useDialogContext } from '@/components/providers/DialogProvider';

export function useDialog() {
  return useDialogContext();
}
