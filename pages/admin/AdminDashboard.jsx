import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { BsBoxSeam, BsGrid, BsTruck, BsCartCheck, BsInboxes } from 'react-icons/bs';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalDistributors: 0,
        totalOrders: 0,
        totalInventoryItems: 0
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
                setError('Không thể tải dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div>
            <h3 className="mb-4">Bảng điều khiển tổng quan</h3>
            <Row className="g-4">
                <Col md={6} lg={3}>
                    <Card className="shadow-sm border-0 bg-primary text-white h-100">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="mb-1">Tổng sản phẩm</h6>
                                <h2 className="mb-0 fw-bold">{stats.totalProducts}</h2>
                            </div>
                            <BsBoxSeam size={40} opacity={0.5} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="shadow-sm border-0 bg-success text-white h-100">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="mb-1">Danh mục</h6>
                                <h2 className="mb-0 fw-bold">{stats.totalCategories}</h2>
                            </div>
                            <BsGrid size={40} opacity={0.5} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="shadow-sm border-0 bg-warning text-dark h-100">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="mb-1">Đơn hàng</h6>
                                <h2 className="mb-0 fw-bold">{stats.totalOrders}</h2>
                            </div>
                            <BsCartCheck size={40} opacity={0.5} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="shadow-sm border-0 bg-info text-white h-100">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="mb-1">Tồn kho (sản phẩm)</h6>
                                <h2 className="mb-0 fw-bold">{stats.totalInventoryItems}</h2>
                            </div>
                            <BsInboxes size={40} opacity={0.5} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;