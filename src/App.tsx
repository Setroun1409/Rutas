import React, { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

interface Cliente {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
}

const clientesMock: Cliente[] = [
  { id: 1, nombre: "Cliente Alpha", lat: 4.651, lng: -74.057 },
  { id: 2, nombre: "Cliente Beta", lat: 4.658, lng: -74.062 },
  { id: 3, nombre: "Cliente Gamma", lat: 4.663, lng: -74.075 },
  { id: 4, nombre: "Cliente Delta", lat: 4.648, lng: -74.065 },
];

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 4.655, lng: -74.065 };

function App() {
  const [clientesSeleccionados, setClientesSeleccionados] = useState<Cliente[]>(
    []
  );
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const directionsOptions = useRef<google.maps.DirectionsRequest | null>(null);

  const toggleCliente = (cliente: Cliente) => {
    setClientesSeleccionados((prev) =>
      prev.some((c) => c.id === cliente.id)
        ? prev.filter((c) => c.id !== cliente.id)
        : [...prev, cliente]
    );
  };

  const generarRuta = () => {
    if (clientesSeleccionados.length < 2) {
      alert("Selecciona al menos 2 clientes");
      return;
    }

    const origen = clientesSeleccionados[0];
    const destino = origen;
    const waypoints = clientesSeleccionados.slice(1).map((c) => ({
      location: { lat: c.lat, lng: c.lng },
      stopover: true,
    }));

    directionsOptions.current = {
      origin: { lat: origen.lat, lng: origen.lng },
      destination: { lat: destino.lat, lng: destino.lng },
      waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "30%", padding: 20 }}>
        <h2>Clientes</h2>
        <ul>
          {clientesMock.map((cliente) => (
            <li key={cliente.id}>
              <label>
                <input
                  type="checkbox"
                  checked={clientesSeleccionados.some(
                    (c) => c.id === cliente.id
                  )}
                  onChange={() => toggleCliente(cliente)}
                />
                {cliente.nombre}
              </label>
            </li>
          ))}
        </ul>
        <button onClick={generarRuta}>Generar Ruta Óptima</button>
      </div>

      <div style={{ width: "70%" }}>
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
          >
            {directionsOptions.current && (
              <DirectionsService
                options={directionsOptions.current}
                callback={(res, status) => {
                  if (status === "OK" && res) {
                    setDirections(res);
                  } else {
                    alert("Error al generar ruta");
                    console.error("Status:", status, res);
                  }
                }}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default App;
