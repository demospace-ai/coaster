"use client";

import dynamic from "next/dynamic";

export const DynamicLoginModal: React.FC = () => {
  const LoginModal = dynamic(() => import("@coaster/components/client").then((mod) => mod.LoginModal));

  return <LoginModal />;
};
