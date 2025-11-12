import React, { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import "./Report.css";
import Header from "./Header";
import { useAuth } from "./context/context.jsx";
import * as turf from "@turf/turf";
import mapData from "./assets/map.json";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function Report() {
  const { rol } = useAuth();
  const { correo } = useAuth();
  const { nombre } = useAuth();
  const [name, setName] = useState(nombre);
  const [email, setEmail] = useState(correo);
  const [age, setAge] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState(null);
  const [zone, setZone] = useState(null);
  const zoneRef = useRef(null);
  const [error, setError] = useState("");

  const validarFormulario = async (e) => {
    e.preventDefault();

    if (!age || !date || !type) {
      setError("All fields are required (except description)");
      return;
    }

    const fechaIngresada = new Date(date);
    const hoy = new Date();
    const fechaMinima = new Date("2023-01-01");

    if (fechaIngresada > hoy) {
      setError("The date cannot be in the future");
      return;
    }

    if (fechaIngresada < fechaMinima) {
      setError("The date cannot be before January 1st, 2023");
      return;
    }

    if (isNaN(age) || Number(age) <= 0) {
      setError("Age must be a positive number");
      return;
    }

    if (!position) {
      setError("Please select a location on the map");
      return;
    }

    if (
      zoneRef.current === null ||
      zoneRef.current === undefined ||
      isNaN(zoneRef.current)
    ) {
      setError("Please select a valid area on the map.");
      return;
    }

    setError("");

    try {
      const response = await window.api.report(
        name,
        email,
        age,
        date,
        type,
        description,
        position.lat,
        position.lng,
        zoneRef.current
      );
      if (response.success) {
        setError("");
      } else {
        setError(response.message || "Error sending report");
      }
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      setError("Error de comunicación con el backend");
      return;
    }

    toast.success("Report sent successfully", {
      position: "top-center",
      autoClose: 2000,
    });

    setName(nombre);
    setEmail(correo);
    setAge("");
    setDate("");
    setType("");
    setDescription("");
    setPosition(null);
    setZone(null);
    zoneRef.current = null;
  };

  const ClickMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        let foundZone = null;

        for (const feature of mapData.features) {
          if (turf.booleanPointInPolygon(turf.point([lng, lat]), feature)) {
            foundZone = Number(feature.properties.Id);
            break;
          }
        }

        if (foundZone) {
          setPosition(e.latlng);
          setZone(foundZone);
          zoneRef.current = foundZone;
          setError("");
        } else {
          setError("Please click inside a valid area.");
          setPosition(null);
          setZone(null);
          zoneRef.current = null;
        }
      },
    });

    return position ? (
      <Marker position={position} icon={customIcon}>
        <Popup>
          Selected location
          {zone && <div>Zone: {zone}</div>}
        </Popup>
      </Marker>
    ) : null;
  };

  return (
    <div className="report-container">
      <Header rol={rol} view="report" />
      <div className="report-content">
        <div className="form-header-text">
          <h1 className="form-title">Make your Report</h1>
          <p className="form-subtitle">Please complete the survey</p>
        </div>

        <form
          onSubmit={validarFormulario}
          className="report-form-single-column"
        >
          <div className="form-group">
            <label htmlFor="name">NAME AND LAST NAME</label>
            <input type="text" id="name" name="name" value={nombre} disabled />
          </div>

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              name="email"
              value={correo}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">AGE</label>
            <input
              type="number"
              id="age"
              name="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Please put your age"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">DATE OF EVENT</label>
            <input
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min="2023-01-01"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">
              TYPE OF VIOLENCE YOU HAVE BEEN A VICTIM OF
            </label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Physical Violence">Physical Violence</option>
              <option value="Psychological Violence">
                Psychological Violence
              </option>
              <option value="Sexual Violence">Sexual Violence</option>
              <option value="Workplace Violence">Workplace Violence</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">PLEASE DESCRIBE THE EVENT</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event (optional)"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="map-area">
              PLEASE SELECT THE AREA ON THE MAP WHERE THE EVENTS OCCURRED.
            </label>
            <div style={{ height: "400px", width: "100%", marginTop: "1rem" }}>
              <MapContainer
                center={[4.638193, -74.084046]}
                zoom={17}
                minZoom={16}
                maxZoom={18}
                maxBounds={[
                  [4.6315, -74.0935],
                  [4.6445, -74.077],
                ]}
                maxBoundsViscosity={1.0}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickMarker />
              </MapContainer>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}
          <button
            type="submit"
            className="submit-btn"
            disabled={
              zoneRef.current === null ||
              zoneRef.current === undefined ||
              isNaN(zoneRef.current)
            }
          >
            SEND THE REPORT
          </button>
        </form>
        <p
          className="form-subtitle"
          style={{ textAlign: "center", fontSize: "0.6rem" }}
        >
          This color symbolizes our dedication to eliminating all forms of
          violence.
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Report;
