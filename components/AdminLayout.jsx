import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            {/* Thanh điều hướng bên trái */}
            <aside className="admin-sidebar">
                <div className="p-3 fs-5 fw-bold text-center border-bottom border-secondary">
                    QUẢN TRỊ HỆ THỐNG
                </div>
                <nav className="mt-2">
                    <Link to="/admin">Bảng điều khiển</Link>
                    <Link to="/admin/warehouses">Quản lý Kho hàng</Link>
                    <Link to="/admin/products">Quản lý Sản phẩm</Link>
                    <Link to="/admin/inventory">Quản lý Nhập kho</Link>
                    <Link to="/admin/orders">Quản lý Đơn hàng</Link>
                    <Link to="/admin/locations">Vị trí lưu trữ</Link>
                    <Link to="/admin/shipping">Đơn vị vận chuyển</Link>
                    <Link to="/admin/distributors">Nhà phân phối</Link>
                    <Link to="/admin/categories">Danh mục sản phẩm</Link>
                    <Link to="/" className="text-warning mt-4 border-top">Quay lại trang khách</Link>
                </nav>
            </aside>

            {/* Khu vực nội dung bên phải */}
            <div className="admin-content">
                {/* Thanh Header của Admin */}
                <header className="admin-topbar">
                    <span className="fw-bold text-dark">Xin chào, Quản trị viên</span>
                    <button className="btn btn-outline-danger btn-sm">Đăng xuất</button>
                </header>

                {/* Vùng hiển thị nội dung động */}
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;