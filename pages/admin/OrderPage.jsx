import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import api from '../../services/api';
import './OrderPage.css';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/admin');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng. Vui lòng kiểm tra quyền truy cập.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Xác nhận chuyển đơn hàng sang trạng thái: ${newStatus}?`)) return;
        
        try {
            const response = await api.put(`/orders/admin/${id}/status`, { status: newStatus });
            if (response.data.success) {
                fetchOrders(); // Tải lại dữ liệu sau khi cập nhật thành công
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng.');
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <Badge bg="warning" text="dark">Chờ xử lý</Badge>;
            case 'confirmed': return <Badge bg="info">Đã xác nhận</Badge>;
            case 'shipping': return <Badge bg="primary">Đang giao</Badge>;
            case 'completed': return <Badge bg="success">Hoàn thành</Badge>;
            case 'cancelled': return <Badge bg="danger">Đã hủy</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="order-container">
            <h3 className="mb-4 m-0">Quản lý Đơn hàng</h3>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Mã ĐH</th>
                        <th>Khách hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr><td colSpan="7" className="text-center">Chưa có đơn hàng nào</td></tr>
                    ) : (
                        orders.map(o => (
                            <tr key={o.id}>
                                <td><strong>#{o.id}</strong></td>
                                <td>
                                    <div>{o.full_name || 'Khách vãng lai'}</div>
                                    <small className="text-muted">{o.phone}</small>
                                </td>
                                <td>{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                                <td><strong className="text-danger">{Number(o.total_amount).toLocaleString('vi-VN')} đ</strong></td>
                                <td>{o.payment_method}</td>
                                <td>{getStatusBadge(o.status || o.order_status)}</td>
                                <td className="text-center">
                                    <Button variant="outline-primary" size="sm" onClick={() => handleViewDetails(o)}>
                                        Xem & Xử lý
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Chi tiết đơn hàng */}
            <Modal show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết Đơn hàng #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <div className="mb-4">
                                <h5>Thông tin giao hàng</h5>
                                <p className="mb-1"><strong>Người nhận:</strong> {selectedOrder.full_name}</p>
                                <p className="mb-1"><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                                <p className="mb-1"><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</p>
                                <p className="mb-1"><strong>Ghi chú:</strong> {selectedOrder.notes || 'Không có'}</p>
                            </div>

                            <div className="mb-4">
                                <h5>Sản phẩm đã đặt</h5>
                                <Table size="sm" bordered>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th className="text-center">Đơn giá</th>
                                            <th className="text-center">Số lượng</th>
                                            <th className="text-end">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.product_name} className="order-item-img me-2" />
                                                        ) : (
                                                            <div className="order-item-img bg-light me-2 d-flex align-items-center justify-content-center text-muted" style={{fontSize: '8px'}}>No img</div>
                                                        )}
                                                        {item.product_name}
                                                    </div>
                                                </td>
                                                <td className="text-center align-middle">{Number(item.price).toLocaleString('vi-VN')} đ</td>
                                                <td className="text-center align-middle">{item.quantity}</td>
                                                <td className="text-end align-middle">{Number(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-end"><strong>Tổng cộng:</strong></td>
                                            <td className="text-end"><strong className="text-danger">{Number(selectedOrder.total_amount).toLocaleString('vi-VN')} đ</strong></td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>

                            <div className="border-top pt-3">
                                <h5>Cập nhật trạng thái</h5>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button variant="warning" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')} disabled={selectedOrder.status === 'pending'}>Chờ xử lý</Button>
                                    <Button variant="info" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')} disabled={selectedOrder.status === 'confirmed'}>Xác nhận</Button>
                                    <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')} disabled={selectedOrder.status === 'shipping'}>Giao hàng</Button>
                                    <Button variant="success" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')} disabled={selectedOrder.status === 'completed'}>Hoàn thành</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} disabled={selectedOrder.status === 'cancelled'}>Hủy đơn</Button>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrderPage;