import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Loading...");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/`)
      .then((res) => setMessage(res.data.message))
      .catch((err) => {
        console.error("Error:", err.message);
        setMessage("Error connecting to server");
      });
  }, [apiUrl]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>{message}</h1>
    </div>
  );
}

export default App;
