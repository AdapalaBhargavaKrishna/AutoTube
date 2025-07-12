import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from './data/UserContext.jsx'
import { SettingsProvider } from './data/SettingsContext';
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <UserProvider>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </UserProvider>
)
