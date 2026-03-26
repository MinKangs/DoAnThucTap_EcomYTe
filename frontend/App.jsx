import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ClientLayout from './components/ClientLayout';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';

// Bổ sung import các Component của phân hệ Admin
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import WarehousePage from './pages/admin/WarehousePage';
import LocationPage from './pages/admin/LocationPage'; 
import DistributorPage from './pages/admin/DistributorPage';
import CategoryPage from './pages/admin/CategoryPage';
import ProductPage from './pages/admin/ProductPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrderPage from './pages/admin/OrderPage';
import UserPage from './pages/admin/UserPage';
import InventoryHistoryPage from './pages/admin/InventoryHistoryPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import RevenueReportPage from './pages/admin/RevenueReportPage';


function App() {
  return (
    <> {/* Thẻ bọc ngoài cùng (Fragment) */}
      <Routes>
        {/* Phân hệ Khách hàng */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
        </Route>

        {/* Phân hệ Quản trị viên */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="warehouses" element={<WarehousePage />} />
            <Route path="locations" element={<LocationPage />} />
            <Route path="distributors" element={<DistributorPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="inventory-history" element={<InventoryHistoryPage />} />
            <Route path="chat" element={<AdminChatPage />} />
            <Route path="revenue" element={<RevenueReportPage />} />
          </Route>
        </Route>
      </Routes>


    </>
  );
}

export default App;