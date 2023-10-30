"use client";

import { createContext, useContext, useState } from "react";

export const LoginContext = createContext<{
  loginOpen: boolean;
  create: boolean;
  openLoginModal: (create?: boolean) => void;
  closeLoginModal: () => void;
}>({
  loginOpen: false,
  create: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});
export const useLoginContext = () => useContext(LoginContext);

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loginOpen, setModalOpen] = useState(false);
  const [create, setCreate] = useState(false);

  return (
    <LoginContext.Provider
      value={{
        loginOpen,
        create,
        openLoginModal: (create?: boolean) => {
          if (create) {
            setCreate(true);
          }
          setModalOpen(true);
        },
        closeLoginModal: () => {
          setModalOpen(false);
          setCreate(false);
        },
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
