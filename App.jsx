import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ClientLayout from './components/ClientLayout';

function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        {/* Đã gọi đúng Component HomePage và ProductsPage */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<div className="container mt-4"><h2>Giỏ hàng</h2></div>} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/admin" element={<div>Bảng điều khiển Quản trị viên</div>} />
    </Routes>
  );
}

export default App;