import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './ShippingPage.css';

const ShippingPage = () => {
    const [shippingPartners, setShippingPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        status: 'active'
    });

    const fetchShippingPartners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/shipping-partners');
            if (response.data.success) {
                setShippingPartners(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu đơn vị vận chuyển từ máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShippingPartners();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', email: '', status: 'active' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ name: '', phone: '', email: '', status: 'active' });
        setShowModal(true);
    };

    const handleShowEdit = (partner) => {
        setEditingId(partner.id);
        setFormData({
            name: partner.name,
            phone: partner.phone || '',
            email: partner.email || '',
            status: partner.status
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
                await api.put(`/shipping-partners/${editingId}`, formData);
            } else {
                await api.post('/shipping-partners', formData);
            }
            fetchShippingPartners(); 
            handleClose();
        } catch (err) {
            alert('Đã xảy ra lỗi khi lưu thông tin đơn vị vận chuyển.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đối tác này không?')) {
            try {
                const response = await api.delete(`/shipping-partners/${id}`);
                if (response.data.success) fetchShippingPartners();
            } catch (err) {
                alert('Không thể xóa đối tác vận chuyển này.');
            }
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="shipping-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0 shipping-title">Quản lý Đơn vị vận chuyển</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Thêm đối tác mới</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Tên đơn vị</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {shippingPartners.length === 0 ? (
                        <tr><td colSpan="6" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        shippingPartners.map(partner => (
                            <tr key={partner.id}>
                                <td>{partner.id}</td>
                                <td><strong>{partner.name}</strong></td>
                                <td>{partner.phone}</td>
                                <td>{partner.email}</td>
                                <td>
                                    <Badge bg={partner.status === 'active' ? 'success' : 'secondary'}>
                                        {partner.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(partner)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(partner.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Đơn vị vận chuyển' : 'Thêm Đơn vị vận chuyển mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên đơn vị <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email liên hệ</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Tạm ngưng</option>
                            </Form.Select>
                        </Form.Group>
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

export default ShippingPage;