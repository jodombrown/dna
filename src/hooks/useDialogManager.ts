import { useState } from 'react';

export type DialogState = Record<string, boolean>;

export const useDialogManager = () => {
  const [dialogs, setDialogs] = useState<DialogState>({});

  const openDialog = (dialogName: string) => {
    setDialogs(prev => ({ ...prev, [dialogName]: true }));
  };

  const closeDialog = (dialogName: string) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  };

  const isDialogOpen = (dialogName: string) => {
    return Boolean(dialogs[dialogName]);
  };

  const toggleDialog = (dialogName: string) => {
    setDialogs(prev => ({ 
      ...prev, 
      [dialogName]: !prev[dialogName] 
    }));
  };

  const closeAllDialogs = () => {
    setDialogs({});
  };

  return {
    dialogs,
    openDialog,
    closeDialog,
    isDialogOpen,
    toggleDialog,
    closeAllDialogs
  };
};