import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/context.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setRol } = useAuth();
  const { setCorreo } = useAuth();
  const { setNombre } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validarLogin = async (e) => {
    e.preventDefault();
    const regex = /^[a-zA-Z0-9._%+-]+@unal\.edu\.co$/;

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!regex.test(email)) {
      setError("El correo debe ser @unal.edu.co");
      return;
    }

    try {
      const response = await window.api.login(email.toLowerCase(), password);

      if (response.success) {
        setError("");
        console.log("Inicio de sesión exitoso");
        setRol(response.rol);
        setCorreo(response.correo);
        setNombre(response.nombre);
        navigate("/map");
      } else {
        setError(response.message || "Error de autenticación");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error de comunicación con el backend");
    }
  };

  return (
    <div className="background">
      <div className="header">CACVi-UN</div>
      <div className="login-box">
        <h1>Login</h1>
        <p>Sign in to continue</p>
        <form onSubmit={validarLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={{ color: "black" }}>{error}</p>}

          <button type="submit">Login</button>
        </form>
        <div className="separator">Or</div>
        <Link to="/register">
          <button className="secondary">Create Account</button>
        </Link>
      </div>
    </div>
  );
}

export default Login;
