
import React from "react";
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found. Make sure your HTML includes <div id='root'></div>");
}

const root = createRoot(container);
root.render(<App />);
