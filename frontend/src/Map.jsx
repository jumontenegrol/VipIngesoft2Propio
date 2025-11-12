import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";
import "./Report.css";
import Header from "./Header";
import { useAuth } from "./context/context.jsx";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    map.eachLayer((layer) => {
      if (layer.options && layer.options.radius === 25) {
        map.removeLayer(layer);
      }
    });

    const heat = L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 18 });
    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
}

function Map() {
  const { rol } = useAuth();
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await window.api.map();
        setUbicaciones(response.data);
        console.log("Coordenadas recuperadas: ", response.data);
      } catch (error) {
        console.error("Error fetching ubicaciones:", error);
      }
    }
    fetchData();
  }, []);

  const heatPoints = ubicaciones.map((u) => [u.latitud, u.longitud]);

  const last20 = ubicaciones.slice(-20);

  return (
    <div className="report-container">
      <Header rol={rol} view="map" />
      <div className="report-content">
        <h1
          className="form-title"
          style={{ textAlign: "center", padding: "0.1rem" }}
        >
          MAP
        </h1>
        <p
          className="form-subtitle"
          style={{ textAlign: "center", fontSize: "0.8rem", padding: "0.3rem" }}
        >
          ON THIS MAP YOU CAN VIEW THE AREAS WITH THE MOST RECORDED CASES
        </p>
        <div style={{ height: "400px", width: "100%" }}>
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
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatmapLayer points={heatPoints} />
            {last20.map((reporte, idx) => (
              <Marker
                key={idx}
                position={[reporte.latitud, reporte.longitud]}
                icon={customIcon}
              >
                <Popup>
                  <strong>Date:</strong> {reporte.fecha}
                  <br />
                  <strong>Type:</strong> {reporte.tipo_de_violencia}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
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

export default Map;
