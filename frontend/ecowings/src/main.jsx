import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './shared/context/AuthContext.jsx'
import { ToastContextProvider } from './components/ui/toaster.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastContextProvider>
        <App />
      </ToastContextProvider>
    </AuthProvider>
  </StrictMode>,
)
