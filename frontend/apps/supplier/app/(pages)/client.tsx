"use client";

import dynamic from "next/dynamic";

export const DynamicLoginModal: React.FC = () => {
  const LoginModal = dynamic(() => import("@coaster/components/login/LoginModal").then((mod) => mod.LoginModal));

  return <LoginModal />;
};
