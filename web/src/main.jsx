import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './context/Store'
import { CatalogProvider } from './context/Catalog'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>,
)
