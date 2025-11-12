import React, { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [rol, setRol] = useState(() => localStorage.getItem("rol"));
  const [correo, setCorreo] = useState(() => localStorage.getItem("correo"));
  const [nombre, setNombre] = useState(() => localStorage.getItem("nombre"));

  // Guardar automáticamente en localStorage cuando cambien
  useEffect(() => {
    if (rol !== null) localStorage.setItem("rol", rol);
    else localStorage.removeItem("rol");
  }, [rol]);

  useEffect(() => {
    if (correo !== null) localStorage.setItem("correo", correo);
    else localStorage.removeItem("correo");
  }, [correo]);

  useEffect(() => {
    if (nombre !== null) localStorage.setItem("nombre", nombre);
    else localStorage.removeItem("nombre");
  }, [nombre]);

  return (
    <AuthContext.Provider
      value={{ rol, setRol, correo, setCorreo, nombre, setNombre }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  return useContext(AuthContext);
}