import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const response = await api.get('/orders/me');
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (err) {
                console.error('Lỗi khi tải lịch sử đơn hàng:', err);
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    // Hàm chuyển đổi trạng thái sang tiếng Việt và màu sắc tương ứng
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
            case 'confirmed': return <Badge bg="info">Đã xác nhận</Badge>;
            case 'shipping': return <Badge bg="primary">Đang giao hàng</Badge>;
            case 'completed': return <Badge bg="success">Hoàn thành</Badge>;
            case 'cancelled': return <Badge bg="danger">Đã hủy</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h3 className="mb-4 fw-bold">Lịch sử đơn hàng của bạn</h3>
            
            {error && <Alert variant="danger">{error}</Alert>}

            {orders.length === 0 && !error ? (
                <Alert variant="info" className="text-center">
                    Bạn chưa có đơn hàng nào. <Link to="/">Mua sắm ngay</Link>
                </Alert>
            ) : (
                orders.map((order) => (
                    <Card key={order.id} className="mb-4 shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <div>
                                <span className="fw-bold me-3">Mã đơn: #{order.id}</span>
                                <span className="text-muted">
                                    Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <div>
                                {getStatusBadge(order.status)}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive borderless className="mb-0">
                                <tbody>
                                    {order.items && order.items.map((item) => (
                                        <tr key={item.order_item_id} className="border-bottom">
                                            <td width="80">
                                                <img 
                                                    src={item.image_url || 'https://via.placeholder.com/80'} 
                                                    alt={item.name} 
                                                    className="img-fluid rounded"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td className="align-middle">
                                                <div className="fw-bold">{item.name}</div>
                                                <div className="text-muted small">Số lượng: x{item.quantity}</div>
                                            </td>
                                            <td className="align-middle text-end fw-bold text-danger">
                                                {Number(item.price_at_purchase).toLocaleString('vi-VN')} đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                <div className="text-muted">
                                    Phương thức thanh toán: <span className="text-dark fw-semibold">{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : order.payment_method}</span>
                                </div>
                                <div className="fs-5">
                                    Tổng tiền: <span className="text-danger fw-bold">{Number(order.total_amount).toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default MyOrdersPage;