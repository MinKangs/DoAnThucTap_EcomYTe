import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
    BsBoxSeam, BsGrid, BsCartCheck, BsArchive, 
    BsBoxArrowInRight, BsGeoAlt, BsTruck, 
    BsBuilding, BsPeople, BsExclamationTriangleFill,
    BsHourglassSplit
} from 'react-icons/bs';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalOrders: 0,
        expiringBatches: 0,
        pendingOrders: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/summary');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (err) {
                setError('Không thể tải dữ liệu thống kê từ máy chủ.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const modules = [
        { title: 'Sản phẩm', icon: <BsBoxSeam size={48} />, path: '/admin/products', color: 'text-primary' },
        { title: 'Đơn hàng', icon: <BsCartCheck size={48} />, path: '/admin/orders', color: 'text-success' },
        { title: 'Nhập kho', icon: <BsBoxArrowInRight size={48} />, path: '/admin/inventory', color: 'text-info' },
        { title: 'Kho hàng', icon: <BsArchive size={48} />, path: '/admin/warehouses', color: 'text-purple' },
        { title: 'Vị trí lưu trữ', icon: <BsGeoAlt size={48} />, path: '/admin/locations', color: 'text-teal' },
        { title: 'Danh mục', icon: <BsGrid size={48} />, path: '/admin/categories', color: 'text-warning' },
        { title: 'Nhà phân phối', icon: <BsBuilding size={48} />, path: '/admin/distributors', color: 'text-indigo' },
    ];

    if (user && user.role === 'admin') {
        modules.push({ title: 'Tài khoản', icon: <BsPeople size={48} />, path: '/admin/users', color: 'text-danger' });
    }

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container p-4">
            <h3 className="fw-bold mb-4 text-dark">Bảng điều khiển</h3>

            <Row className="g-4 mb-5">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm dashboard-stat-card h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center">
                                <BsBoxSeam size={32} className="text-primary" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 fw-semibold">Tổng sản phẩm</h6>
                                <h3 className="mb-0 fw-bold text-dark">{stats.totalProducts || 0}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm dashboard-stat-card h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center">
                                <BsCartCheck size={32} className="text-success" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 fw-semibold">Tổng đơn hàng</h6>
                                <h3 className="mb-0 fw-bold text-dark">{stats.totalOrders || 0}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm dashboard-stat-card h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3 d-flex align-items-center justify-content-center">
                                <BsPeople size={32} className="text-info" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 fw-semibold">Người dùng</h6>
                                <h3 className="mb-0 fw-bold text-dark">{stats.totalUsers || 0}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Link to="/admin/orders" className="text-decoration-none">
                        <Card className="border-0 shadow-sm dashboard-stat-card h-100 bg-primary bg-opacity-10 border-primary border-start border-4">
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="p-3 me-3 d-flex align-items-center justify-content-center">
                                    <BsHourglassSplit size={32} className="text-primary" />
                                </div>
                                <div>
                                    <h6 className="text-dark mb-1 fw-bold">Đơn chờ duyệt</h6>
                                    <h3 className="mb-0 fw-bold text-primary">
                                        {stats.pendingOrders || 0} <span className="fs-6 fw-normal text-dark">đơn</span>
                                    </h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col lg={3} md={6}>
                    <Link to="/admin/inventory" className="text-decoration-none">
                        <Card className="border-0 shadow-sm dashboard-stat-card h-100 bg-warning bg-opacity-10 border-warning border-start border-4">
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="p-3 me-3 d-flex align-items-center justify-content-center">
                                    <BsExclamationTriangleFill size={32} className="text-warning" />
                                </div>
                                <div>
                                    <h6 className="text-dark mb-1 fw-bold">Cảnh báo hạn dùng</h6>
                                    <h3 className="mb-0 fw-bold text-danger">
                                        {stats.expiringBatches || 0} <span className="fs-6 fw-normal text-dark">lô hàng</span>
                                    </h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
            </Row>

            <h4 className="fw-bold mb-4 text-secondary">Phân hệ quản lý</h4>
            
            <Row className="g-4">
                {modules.map((mod, idx) => (
                    <Col lg={3} md={4} sm={6} key={idx}>
                        <Link to={mod.path} className="text-decoration-none">
                            <Card className="border-0 shadow-sm dashboard-module-card h-100">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-5">
                                    <div className={`${mod.color} mb-3 transition-icon`}>
                                        {mod.icon}
                                    </div>
                                    <h5 className="fw-bold text-dark m-0">{mod.title}</h5>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default AdminDashboard;