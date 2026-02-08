import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Leaflet CSS moved to DubaiZonesSection component (lazy loaded with it)
// to avoid blocking initial page render with unused CSS.

// Auto-reload on stale chunks after deployment
window.addEventListener("unhandledrejection", (event) => {
  const msg = event.reason?.message || "";
  if (msg.includes("dynamically imported module") || msg.includes("Loading chunk")) {
    const key = "chunk-reload";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
