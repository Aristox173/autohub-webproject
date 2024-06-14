import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../models/contexts/AuthContext"; // Ajusta la ruta según tu estructura de proyecto
import "../../styles/mechanicSidebar.css"; // Asegúrate de crear este archivo CSS

const MechanicSidebar = () => {
  const { currentUser, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="mechanic-sidebar">
      <button className="sidebar-button">
        <Link to={`/${currentUser.uid}/selection`}>Selection</Link>
      </button>
      <button className="sidebar-button">
        <Link to={`/${currentUser.uid}/orders`}>Orders</Link>
      </button>
      <button className="sidebar-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default MechanicSidebar;
