import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ClientLayout from './components/ClientLayout';

// Bổ sung import các Component của phân hệ Admin
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WarehousePage from './pages/admin/WarehousePage';
import LocationPage from './pages/admin/LocationPage'; 
import ShippingPage from './pages/admin/ShippingPage';
import DistributorPage from './pages/admin/DistributorPage';
import CategoryPage from './pages/admin/CategoryPage';
import ProductPage from './pages/admin/ProductPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrderPage from './pages/admin/OrderPage';

function App() {
  return (
    <Routes>
      {/* Phân hệ Khách hàng */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<div className="container mt-4"><h2>Giỏ hàng</h2></div>} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Phân hệ Quản trị viên */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="warehouses" element={<WarehousePage />} />
        <Route path="locations" element={<LocationPage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="distributors" element={<DistributorPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrderPage />} />
      </Route>
    </Routes>
  );
}

export default App;