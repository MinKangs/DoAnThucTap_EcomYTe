import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider> {/* Bọc ứng dụng tại đây */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)