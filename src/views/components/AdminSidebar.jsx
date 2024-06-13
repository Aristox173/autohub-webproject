import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../models/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import "../../styles/adminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="admin-sidebar">
      <button className="sidebar-button">
        <Link to="/admin/users">Manage Users</Link>
      </button>
      <button className="sidebar-button">
        <Link to="/admin/products">Manage Products</Link>
      </button>
      <button className="sidebar-button">
        <Link to="/admin/orders">Manage Orders</Link>
      </button>
      <button className="sidebar-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
