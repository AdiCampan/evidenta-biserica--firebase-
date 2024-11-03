import { useState, useEffect, useRef } from "react";

function Observatii({ data, dataUpdated }) {
  const [input, setInput] = useState("");
  const isInitialLoad = useRef(true); // Flag de carga inicial

  // Efecto para inicializar el estado `input` con los datos iniciales de `data`
  useEffect(() => {
    setInput(data[0].observations || "");
  }, [data]);

  // Efecto para ejecutar `dataUpdated` solo si no es carga inicial
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false; // Finaliza la carga inicial aquí
      return;
    }

    dataUpdated({
      observations: input,
    });
  }, [input]);

  return (
    <div style={{ paddingLeft: "30px" }}>
      <h3>Observatii</h3>
      <textarea
        className="observatii"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
    </div>
  );
}

export default Observatii;
