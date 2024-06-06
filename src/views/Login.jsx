import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../models/contexts/AuthContext";
import { Link } from "react-router-dom";
import { loginUser } from "../controllers/userController.ts";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { user, isSupplier } = await loginUser(email, password);

      dispatch({ type: "LOGIN", payload: user });

      if (isSupplier) {
        navigate(`/${user.uid}/list`);
      } else {
        navigate(`/${user.uid}/selection`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <button className="register-button">
        <Link to="/register">Register</Link>
      </button>
    </div>
  );
};

export default Login;
