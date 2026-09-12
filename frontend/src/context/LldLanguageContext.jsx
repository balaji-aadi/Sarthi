import React, { createContext, useContext, useState, useEffect } from 'react';

const LldLanguageContext = createContext({
  language: 'cpp',
  setLanguage: () => {},
  availableLanguages: [
    { id: 'cpp', label: 'C++', ext: 'cpp', compiler: 'g++' },
    { id: 'java', label: 'Java', ext: 'java', compiler: 'javac' },
    { id: 'python', label: 'Python', ext: 'py', compiler: 'python3' }
  ]
});

const STORAGE_KEY = 'sarthi_lld_language';

export function LldLanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['cpp', 'java', 'python'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'cpp';
  });

  const setLanguage = (lang) => {
    if (['cpp', 'java', 'python'].includes(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}
    }
  };

  const availableLanguages = [
    { id: 'cpp', label: 'C++', ext: 'cpp', compiler: 'g++' },
    { id: 'java', label: 'Java', ext: 'java', compiler: 'javac' },
    { id: 'python', label: 'Python', ext: 'py', compiler: 'python3' }
  ];

  return (
    <LldLanguageContext.Provider value={{ language, setLanguage, availableLanguages }}>
      {children}
    </LldLanguageContext.Provider>
  );
}

export function useLldLanguage() {
  const context = useContext(LldLanguageContext);
  if (!context) {
    throw new Error('useLldLanguage must be used within an LldLanguageProvider');
  }
  return context;
}
