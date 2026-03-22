import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Spinner } from 'react-bootstrap';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    // Cho phép admin hoặc staff truy cập
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;