import React, { useContext } from "react";
import { createContext, useState } from "react";

export const LoaderContext = createContext();

export const useLoading = () => {
  return useContext(LoaderContext);
};

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleLoading = (data) => {
    setIsLoading(data);
    // Safety failsafe: if loading is stuck for more than 15 seconds, auto-clear it
    if (data === true) {
        setTimeout(() => {
            setIsLoading(prev => {
                if (prev === true) {
                    console.warn("Loader was stuck for 15s, auto-clearing...");
                    return false;
                }
                return prev;
            });
        }, 15000);
    }
  };
  return (
    <LoaderContext.Provider
      value={{
        isLoading,
        handleLoading,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export default LoaderContext;
