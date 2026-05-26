import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Import global styling
import App from './App.jsx' // Import the root App component

// createRoot connects React to the actual HTML file inside the <div id="root"></div> element.
// .render() tells React to render our <App /> component inside that HTML shell.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
