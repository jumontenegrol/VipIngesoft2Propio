import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./Statistics.css";
import { useAuth } from "./context/context.jsx";

function Statistics() {
  const { rol } = useAuth();

  const [incidentes, setIncidentes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await window.api.statistics();
        setIncidentes(response.data);
        console.log("Incidentes data:", response.data);
      } catch (error) {
        console.error("Error in Statistics component:", error);
        setError("Error al cargar los datos de estadísticas");
      }
    }

    fetchData();
  }, []);

  return (
    <div className="Statistics-container">
      <Header rol={rol} view="statistics" />
      <div className="Statistics-content">
        <h1
          className="Statistics-form-title"
          style={{ textAlign: "center", padding: "0.1rem" }}
        >
          STATISTICS
        </h1>
        <p
          className="Statistics-form-subtitle"
          style={{ textAlign: "center", fontSize: "0.8rem", padding: "0.3rem" }}
        >
          IN THIS SPACE YOU CAN SEE THE GENERAL STATISTICS
        </p>

        {/* Mensaje de error si lo hay */}
        {error && <p className="error-message">{error}</p>}

        {/* Tabla de incidentes */}
        {incidentes.length > 0 ? (
          <div className="tabla-container">
            <table className="tabla-incidentes">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Edad</th>
                  <th>Fecha</th>
                  <th>Tipo de violencia</th>
                  <th>Descripción</th>
                  <th>Zona</th>
                </tr>
              </thead>
              <tbody>
                {incidentes.map((inc, index) => (
                  <tr key={index}>
                    <td>{inc.nombre}</td>
                    <td>{inc.correo}</td>
                    <td>{inc.edad}</td>
                    <td>{inc.fecha}</td>
                    <td>{inc.tipo_de_violencia}</td>
                    <td>{inc.descripcion}</td>
                    <td>{inc.zona}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && (
            <p style={{ textAlign: "center", fontSize: "0.8rem" }}>
              No hay datos disponibles.
            </p>
          )
        )}
        <p
          className="form-subtitle"
          style={{ textAlign: "center", fontSize: "0.6rem" }}
        >
          This color symbolizes our dedication to eliminating all forms of
          violence.
        </p>
      </div>
    </div>
  );
}

export default Statistics;
