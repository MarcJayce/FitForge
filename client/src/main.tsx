import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeDB } from './lib/db';

// Initialize IndexedDB before rendering the app
initializeDB().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch(error => {
  console.error("Failed to initialize database:", error);
  // Still render the app, but it might have reduced functionality
  createRoot(document.getElementById("root")!).render(<App />);
});
