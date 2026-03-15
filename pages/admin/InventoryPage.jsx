import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import api from '../../services/api';
import './InventoryPage.css';

const InventoryPage = () => {
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        product_id: '',
        location_id: '',
        batch_number: '',
        quantity: '',
        import_date: '',
        expiration_date: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, prodRes, locRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/products'),
                api.get('/locations')
            ]);
            
            if (invRes.data.success) setBatches(invRes.data.data);
            if (prodRes.data.success) setProducts(prodRes.data.data);
            if (locRes.data.success) setLocations(locRes.data.data);
            
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng kiểm tra quyền truy cập hoặc kết nối máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ product_id: '', location_id: '', batch_number: '', quantity: '', import_date: '', expiration_date: '' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ 
            product_id: products.length > 0 ? products[0].id : '', 
            location_id: locations.length > 0 ? locations[0].id : '', 
            batch_number: '', 
            quantity: '', 
            import_date: new Date().toISOString().split('T')[0], // Mặc định ngày hôm nay
            expiration_date: '' 
        });
        setShowModal(true);
    };

    const handleShowEdit = (batch) => {
        setEditingId(batch.id);
        setFormData({
            product_id: batch.product_id,
            location_id: batch.location_id || '',
            batch_number: batch.batch_number,
            quantity: batch.quantity,
            import_date: batch.import_date ? batch.import_date.split('T')[0] : '',
            expiration_date: batch.expiration_date ? batch.expiration_date.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/inventory/${editingId}`, formData);
            } else {
                // Sử dụng đường dẫn /import theo cấu hình route mới nhất
                await api.post('/inventory/import', formData);
            }
            fetchData(); 
            handleClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu lô hàng.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lô hàng này không?')) {
            try {
                const response = await api.delete(`/inventory/${id}`);
                if (response.data.success) fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Không thể xóa lô hàng này.');
            }
        }
    };

    // Hàm kiểm tra sắp hết hạn (dưới 30 ngày)
    const isExpiringSoon = (dateString) => {
        if (!dateString) return false;
        const expDate = new Date(dateString);
        const today = new Date();
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    };

    // Hàm kiểm tra đã hết hạn
    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="inventory-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0">Quản lý Nhập kho & Lô hàng</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Nhập kho</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Mã lô</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Vị trí</th>
                        <th>Ngày nhập</th>
                        <th>Hạn sử dụng</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.length === 0 ? (
                        <tr><td colSpan="7" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        batches.map(b => (
                            <tr key={b.id} className={isExpired(b.expiration_date) ? 'table-expired' : ''}>
                                <td><strong>{b.batch_number}</strong></td>
                                <td>{b.product_name}</td>
                                <td>{b.quantity}</td>
                                <td>
                                    {b.warehouse_name ? `${b.warehouse_name} - ${b.zone} (${b.shelf})` : 'Chưa xếp vị trí'}
                                </td>
                                <td>{new Date(b.import_date).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    {new Date(b.expiration_date).toLocaleDateString('vi-VN')}
                                    {isExpired(b.expiration_date) && <Badge bg="danger" className="ms-2">Hết hạn</Badge>}
                                    {isExpiringSoon(b.expiration_date) && <Badge bg="warning" text="dark" className="ms-2">Sắp hết hạn</Badge>}
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(b)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(b.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Lô hàng' : 'Nhập lô hàng mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sản phẩm <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="product_id" value={formData.product_id} onChange={handleChange} required disabled={!!editingId}>
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lô (Batch Number) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lượng nhập <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Vị trí lưu trữ <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="location_id" value={formData.location_id} onChange={handleChange} required>
                                        <option value="">-- Chọn vị trí xếp hàng --</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.warehouse_name} - {loc.zone} {loc.shelf ? `(${loc.shelf})` : ''}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày nhập kho <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="import_date" value={formData.import_date} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hạn sử dụng <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Hủy bỏ</Button>
                        <Button variant="primary" type="submit">Lưu thông tin</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default InventoryPage;