import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import About from "./About.jsx";  // ⭐ neue About Page

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />  {/* ⭐ neue Route */}
        </Routes>
      </BrowserRouter>
  </StrictMode>
);
