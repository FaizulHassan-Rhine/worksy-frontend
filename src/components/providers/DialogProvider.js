'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [promptValue, setPromptValue] = useState('');

  const closeDialog = useCallback(() => {
    setDialog(null);
    setPromptValue('');
  }, []);

  const confirm = useCallback(({ title, description, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        title,
        description,
        confirmText,
        cancelText,
        resolve,
      });
    });
  }, []);

  const prompt = useCallback(
    ({
      title,
      description,
      defaultValue = '',
      placeholder = '',
      confirmText = 'Save',
      cancelText = 'Cancel',
    }) => {
      setPromptValue(defaultValue);
      return new Promise((resolve) => {
        setDialog({
          type: 'prompt',
          title,
          description,
          confirmText,
          cancelText,
          placeholder,
          resolve,
        });
      });
    },
    []
  );

  const onCancel = useCallback(() => {
    if (dialog?.resolve) {
      dialog.resolve(dialog.type === 'prompt' ? null : false);
    }
    closeDialog();
  }, [closeDialog, dialog]);

  const onConfirm = useCallback(() => {
    if (!dialog?.resolve) return;
    if (dialog.type === 'prompt') {
      dialog.resolve(promptValue);
    } else {
      dialog.resolve(true);
    }
    closeDialog();
  }, [closeDialog, dialog, promptValue]);

  const value = useMemo(() => ({ confirm, prompt }), [confirm, prompt]);

  return (
    <DialogContext.Provider value={value}>
      {children}

      <Modal open={Boolean(dialog)} onClose={onCancel} title={dialog?.title} description={dialog?.description}>
        {dialog?.type === 'prompt' && (
          <div className="mb-4">
            <Input
              autoFocus
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder={dialog.placeholder}
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {dialog?.cancelText || 'Cancel'}
          </Button>
          <Button onClick={onConfirm}>{dialog?.confirmText || 'Confirm'}</Button>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}
