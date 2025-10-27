import { useState, useEffect, useRef } from "react";

const normalizarTexto = (texto) =>
  (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const FiltroGiro = ({ value, onChangeFiltro, listaOriginal = [] }) => {
  const [textoInput, setTextoInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!textoInput.trim()) {
      setSugerencias([]);
      return;
    }

    const coincidencias = [
      ...new Set(
        listaOriginal.filter((giro) =>
          normalizarTexto(giro).includes(normalizarTexto(textoInput))
        )
      ),
    ];

    setSugerencias(coincidencias.slice(0, 30)); // puedes ajustar el límite
  }, [textoInput, listaOriginal]);

  const manejarBuscar = () => {
    onChangeFiltro(textoInput);
    setMostrarSugerencias(false);
  };

  const seleccionarSugerencia = (giro) => {
    setTextoInput(giro);
    inputRef.current?.focus();
    // NO filtramos aún, solo actualizamos input
  };

  const limpiarInput = () => {
    setTextoInput("");
    onChangeFiltro("");
    setSugerencias([]);
    inputRef.current?.focus();
  };

  const manejarKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      manejarBuscar();
    }
  };

  return (
    <div style={{ position: "absolute", top: 90, left: 10, zIndex: 1050, width: 260 }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="🔍 Buscar giro comercial..."
        value={textoInput}
        onChange={(e) => {
          setTextoInput(e.target.value);
          setMostrarSugerencias(true);
        }}
        onKeyDown={manejarKeyDown}
        onFocus={() => setMostrarSugerencias(true)}
        style={{
          width: "100%",
          padding: "8px ",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />

      <div style={{ display: "flex", marginTop: 6, gap: 6 }}>
        <button
          onClick={manejarBuscar}
          style={{
            flex: 1,
            padding: "6px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Buscar
        </button>
        <button
          onClick={limpiarInput}
          style={{
            padding: "6px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Limpiar
        </button>
      </div>

      {mostrarSugerencias && sugerencias.length > 0 && (
        <div
          style={{
            marginTop: 8,
            maxHeight: 160,
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: 6,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {sugerencias.map((giro, idx) => (
            <div
              key={idx}
              onClick={() => seleccionarSugerencia(giro)}
              style={{
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "13px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "90%",
                borderBottom: idx < sugerencias.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
              title={giro}
            >
              {giro}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FiltroGiro;
