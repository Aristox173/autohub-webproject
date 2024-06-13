import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllUsers } from "../../controllers/adminController.ts";
import "../../styles/list.css";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await fetchAllUsers();
        setUsers(userList);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <AdminSidebar />
      <div className="list-container">
        <button className="create-button">
          <Link to={`new`}>Create User</Link>
        </button>
        <br />
        <h2>All Users</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isSupplier ? "Supplier" : "Mechanic"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
