import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "src/root/model";

type AuthenticationProps = {
  element: ReactNode;
};

export const RequireAuth: React.FC<AuthenticationProps> = (props) => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  return <>{isAuthenticated ? props.element : <Navigate to="/login" replace />}</>;
};
