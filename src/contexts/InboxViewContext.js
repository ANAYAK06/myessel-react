// src/contexts/InboxViewContext.js
import React, { createContext, useContext, useState } from 'react';

const InboxViewContext = createContext();

export const useInboxView = () => {
  const context = useContext(InboxViewContext);
  if (!context) {
    throw new Error('useInboxView must be used within an InboxViewProvider');
  }
  return context;
};

export const InboxViewProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem('inbox-view-mode');
    if (savedViewMode === 'split' || savedViewMode === 'list') {
      return savedViewMode;
    }

    // Default to split (Outlook-style) view
    return 'split';
  });

  const updateViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('inbox-view-mode', mode);
  };

  const toggleViewMode = () => {
    updateViewMode(viewMode === 'split' ? 'list' : 'split');
  };

  const setSplitView = () => {
    updateViewMode('split');
  };

  const setListView = () => {
    updateViewMode('list');
  };

  return (
    <InboxViewContext.Provider value={{
      viewMode,
      toggleViewMode,
      setSplitView,
      setListView,
      isListView: viewMode === 'list'
    }}>
      {children}
    </InboxViewContext.Provider>
  );
};
