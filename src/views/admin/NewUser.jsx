import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../controllers/adminController.ts";
import "../../styles/register.css";

const NewUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    isSupplier: true,
  });
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { id, value } = e.target;
    setUserData({
      ...userData,
      [id]: id === "isSupplier" ? value === "true" : value,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await registerUser(userData);
      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <h1>Create User</h1>
      <form onSubmit={handleAdd} className="register-form">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="User 1"
          value={userData.name}
          onChange={handleInput}
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="user1@email.com"
          value={userData.email}
          onChange={handleInput}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="**********"
          value={userData.password}
          onChange={handleInput}
        />
        <label htmlFor="isSupplier">Choose a role:</label>
        <select
          id="isSupplier"
          value={userData.isSupplier}
          onChange={handleInput}
        >
          <option value="true">Supplier</option>
          <option value="false">Mechanic</option>
        </select>
        <button type="submit" className="register-button">
          Create
        </button>
      </form>
      <button onClick={() => navigate(-1)} className="new-button">
        Back
      </button>
    </div>
  );
};

export default NewUser;
