import { useState, useEffect } from "react";

function Observatii({ data, dataUpdated }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    dataUpdated({
      observations: input,
    });
  }, [input]);

  useEffect(() => {
    setInput(data[0].observations || "");
  }, [data]);

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
