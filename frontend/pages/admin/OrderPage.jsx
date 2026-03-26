import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Spinner, Alert, Badge, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsFilterRight, BsEye } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css'; // Kế thừa CSS dùng chung

const OrderPage = () => {
    // 1. GIỮ NGUYÊN STATE GỐC
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Thêm State cho bộ lọc (không ảnh hưởng backend)
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // 2. GIỮ NGUYÊN LOGIC FETCH DỮ LIỆU
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

    // 3. LOGIC BỘ LỌC TÍCH HỢP (Tìm kiếm + Trạng thái)
    const isFiltering = searchTerm !== '' || filterStatus !== '';
    const filteredOrders = orders.filter(o => {
        const searchStr = searchTerm.toLowerCase();
        // Tìm theo ID đơn hàng, Tên khách, hoặc Số điện thoại
        const matchSearch = 
            o.id.toString().includes(searchStr) ||
            (o.full_name && o.full_name.toLowerCase().includes(searchStr)) ||
            (o.phone && o.phone.includes(searchStr));
            
        const currentStatus = o.status || o.order_status;
        const matchStatus = filterStatus === '' || currentStatus === filterStatus;
        
        return matchSearch && matchStatus;
    });

    // 4. GIỮ NGUYÊN CÁC HÀM XỬ LÝ
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
                fetchOrders();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng.');
        }
    };

    // Nâng cấp giao diện Badge trạng thái
    const getStatusBadge = (status) => {
        const config = {
            'pending': { bg: '#fff3cd', color: '#856404', text: 'Chờ xử lý' },
            'confirmed': { bg: '#d1ecf1', color: '#0c5460', text: 'Đã xác nhận' },
            'shipping': { bg: '#cce5ff', color: '#004085', text: 'Đang giao' },
            'completed': { bg: '#d4edda', color: '#155724', text: 'Hoàn thành' },
            'cancelled': { bg: '#f8d7da', color: '#721c24', text: 'Đã hủy' }
        };
        const s = config[status] || { bg: '#e2e8f0', color: '#475569', text: status };
        return (
            <span className="badge px-3 py-2 fw-medium" style={{ backgroundColor: s.bg, color: s.color, borderRadius: '8px' }}>
                {s.text}
            </span>
        );
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            {/* Tiêu đề trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Đơn hàng</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredOrders.length} đơn hàng phù hợp` 
                            : `Có tất cả ${orders.length} đơn hàng trong hệ thống`}
                    </p>
                </div>
            </div>

            {/* Thanh công cụ Tìm kiếm & Lọc */}
            <div className="table-toolbar">
                <Row className="g-3 align-items-center">
                    <Col md={7}>
                        <InputGroup className="shadow-sm">
                            <Form.Control 
                                placeholder="Tìm kiếm theo mã đơn, tên khách hoặc số điện thoại..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-end-0"
                            />
                            <Button variant="success" className="d-flex align-items-center px-3 z-0">
                                <BsSearch size={16} />
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select 
                            className="shadow-sm border-0"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao hàng</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </Form.Select>
                    </Col>
                    <Col md={1} className="d-flex justify-content-end">
                        <BsFilterRight size={28} className="text-secondary" title="Công cụ lọc" />
                    </Col>
                </Row>
            </div>

            {/* Bảng dữ liệu */}
            <Table responsive hover className="custom-table border-0 shadow-sm">
                <thead>
                    <tr>
                        <th className="ps-4">Mã ĐH</th>
                        <th>Thông tin khách hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-5 text-muted">Không có đơn hàng nào khớp với điều kiện lọc</td></tr>
                    ) : (
                        filteredOrders.map(o => (
                            <tr key={o.id}>
                                <td className="ps-4">
                                    <strong className="text-primary">#{o.id}</strong>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{o.full_name || 'Khách vãng lai'}</div>
                                    <small className="text-muted">{o.phone}</small>
                                </td>
                                <td>{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                                <td><strong className="text-danger">{Number(o.total_amount).toLocaleString('vi-VN')} đ</strong></td>
                                <td>
                                    <span className="text-uppercase small fw-bold text-secondary">{o.payment_method}</span>
                                </td>
                                <td>{getStatusBadge(o.status || o.order_status)}</td>
                                <td className="text-center pe-4">
                                    <Button 
                                        variant="light" 
                                        size="sm" 
                                        className="text-primary shadow-sm btn-icon border" 
                                        onClick={() => handleViewDetails(o)}
                                        title="Xem & Xử lý"
                                    >
                                        <BsEye size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Chi tiết đơn hàng */}
            <Modal show={showModal} onHide={handleClose} size="lg" className="custom-modal" centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="fw-bold fs-5">Chi tiết Đơn hàng #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedOrder && (
                        <>
                            <Row className="mb-4 g-4">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-3 border h-100">
                                        <h6 className="fw-bold mb-3 text-uppercase small text-muted">Thông tin giao hàng</h6>
                                        <p className="mb-2"><strong>Người nhận:</strong> {selectedOrder.full_name}</p>
                                        <p className="mb-2"><strong>Điện thoại:</strong> {selectedOrder.phone}</p>
                                        <p className="mb-2"><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</p>
                                        <p className="mb-0"><strong>Ghi chú:</strong> {selectedOrder.notes || <span className="text-muted italic">Không có</span>}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-center align-items-center text-center">
                                        <h6 className="fw-bold mb-3 text-uppercase small text-muted w-100">Trạng thái hiện tại</h6>
                                        <div className="mb-2">{getStatusBadge(selectedOrder.status || selectedOrder.order_status)}</div>
                                        <small className="text-muted">Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</small>
                                    </div>
                                </Col>
                            </Row>

                            <div className="mb-4">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Sản phẩm đã đặt</h6>
                                <Table hover className="align-middle border rounded-3 overflow-hidden custom-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3">Sản phẩm</th>
                                            <th className="text-center">Đơn giá</th>
                                            <th className="text-center">SL</th>
                                            <th className="text-end pe-3">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="ps-3">
                                                    <div className="d-flex align-items-center">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.product_name} className="rounded border me-3" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                                        ) : (
                                                            <div className="rounded border bg-white me-3 d-flex align-items-center justify-content-center text-muted" style={{width: '40px', height: '40px', fontSize: '10px'}}>N/A</div>
                                                        )}
                                                        <span className="fw-medium text-dark">{item.product_name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">{Number(item.price || item.price_at_purchase).toLocaleString('vi-VN')} đ</td>
                                                <td className="text-center fw-bold text-secondary">x{item.quantity}</td>
                                                <td className="text-end pe-3 fw-bold text-dark">{Number((item.price || item.price_at_purchase) * item.quantity).toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-light">
                                            <td colSpan="3" className="text-end border-0 pt-3"><strong>Tổng cộng:</strong></td>
                                            <td className="text-end pe-3 border-0 pt-3"><strong className="text-danger fs-5">{Number(selectedOrder.total_amount).toLocaleString('vi-VN')} đ</strong></td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>

                            <div className="border-top pt-4">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Cập nhật trạng thái đơn hàng</h6>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button variant="outline-warning" className="fw-medium" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')} disabled={selectedOrder.status === 'pending'}>Chờ xử lý</Button>
                                    <Button variant="outline-info" className="fw-medium" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')} disabled={selectedOrder.status === 'confirmed'}>Xác nhận</Button>
                                    <Button variant="outline-primary" className="fw-medium" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')} disabled={selectedOrder.status === 'shipping'}>Giao hàng</Button>
                                    <Button variant="outline-success" className="fw-medium" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')} disabled={selectedOrder.status === 'completed'}>Hoàn thành</Button>
                                    <Button variant="outline-danger" className="fw-medium" size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} disabled={selectedOrder.status === 'cancelled'}>Hủy đơn</Button>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 pt-0">
                    <Button variant="light" className="px-4 fw-medium border shadow-sm" onClick={handleClose}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrderPage;