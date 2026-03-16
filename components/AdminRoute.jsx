import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Spinner } from 'react-bootstrap';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    // Trong lúc đang kiểm tra token/đăng nhập thì hiện loading
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    // Nếu chưa đăng nhập HOẶC đã đăng nhập nhưng role không phải 'admin' -> Đuổi về trang chủ
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Nếu đúng là admin -> Cho phép đi tiếp vào các trang bên trong
    return <Outlet />;
};

export default AdminRoute;