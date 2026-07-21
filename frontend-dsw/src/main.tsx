import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.tsx'
import ResponsiveAppBar from './navBar.tsx'



const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <ResponsiveAppBar />
    <App />
  </StrictMode>,
)
