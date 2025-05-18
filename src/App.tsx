import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";

interface Cliente {
  id: number;
  idType: string;
  name: string;
  address: string;
  phone: string;
  salespersonId?: number;
  lat?: number;
  lng?: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 4.655, lng: -74.065 };

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api/customer";

function App() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesSeleccionados, setClientesSeleccionados] = useState<Cliente[]>(
    []
  );
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const directionsOptions = useRef<google.maps.DirectionsRequest | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (!isLoaded) return;

    const fetchClientes = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const dataRaw = await res.json();

        const geocoder = new window.google.maps.Geocoder();

        const geocodeClientes = await Promise.all(
          dataRaw.map(
            (clienteRaw: any) =>
              new Promise<Cliente>((resolve) => {
                geocoder.geocode(
                  { address: clienteRaw.address },
                  (results, status) => {
                    if (status === "OK" && results && results[0]) {
                      const location = results[0].geometry.location;
                      resolve({
                        id: Number(clienteRaw.id),
                        idType: clienteRaw.idType,
                        name: clienteRaw.name,
                        address: clienteRaw.address,
                        phone: clienteRaw.phone,
                        salespersonId: clienteRaw.salespersonId
                          ? Number(clienteRaw.salespersonId)
                          : undefined,
                        lat: location.lat(),
                        lng: location.lng(),
                      });
                    } else {
                      console.warn(
                        "Geocoding failed for",
                        clienteRaw.address,
                        status
                      );
                      resolve({
                        id: Number(clienteRaw.id),
                        idType: clienteRaw.idType,
                        name: clienteRaw.name,
                        address: clienteRaw.address,
                        phone: clienteRaw.phone,
                        salespersonId: clienteRaw.salespersonId
                          ? Number(clienteRaw.salespersonId)
                          : undefined,
                      });
                    }
                  }
                );
              })
          )
        );

        setClientes(
          geocodeClientes.filter(
            (c) => c.lat !== undefined && c.lng !== undefined
          )
        );
      } catch (err) {
        console.error("Error al obtener clientes:", err);
        alert(
          `No se pudieron cargar los clientes: ${
            err instanceof Error ? err.message : err
          }`
        );
      }
    };

    fetchClientes();
  }, [isLoaded]);

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
      location: { lat: c.lat!, lng: c.lng! },
      stopover: true,
    }));

    directionsOptions.current = {
      origin: { lat: origen.lat!, lng: origen.lng! },
      destination: { lat: destino.lat!, lng: destino.lng! },
      waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    setDirections(null);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "30%", padding: 20 }}>
        <h2>Clientes</h2>
        <ul>
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <label>
                <input
                  type="checkbox"
                  checked={clientesSeleccionados.some(
                    (c) => c.id === cliente.id
                  )}
                  onChange={() => toggleCliente(cliente)}
                />
                {cliente.name}
              </label>
            </li>
          ))}
        </ul>
        <button onClick={generarRuta}>Generar Ruta Óptima</button>
      </div>

      <div style={{ width: "70%" }}>
        {isLoaded && (
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
        )}
      </div>
    </div>
  );
}

export default App;
