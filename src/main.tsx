
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug: Check for the root element and log React version.
if (!document.getElementById("root")) {
  console.error("Root element not found. Make sure your HTML includes <div id='root'></div>");
} else {
  console.log("React version:", React?.version);
}
createRoot(document.getElementById("root")!).render(<App />);
