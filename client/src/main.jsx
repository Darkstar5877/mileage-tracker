import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // if you’re using Tailwind or any global styles

// ✅ Register the service worker BEFORE rendering React
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => console.log("✅ Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed:", err));
  });
}

// ✅ Now render the React app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
