<<<<<<< HEAD
=======
import React from 'react'
>>>>>>> 0e5f73e (fix: σωστό .gitignore, προστασία admin routes, cleanup node_modules από git, πλήρες setup για prod)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
