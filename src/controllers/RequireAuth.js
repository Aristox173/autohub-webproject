import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../models/contexts/AuthContext";

const RequireAuth = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" />;
};

export default RequireAuth;
