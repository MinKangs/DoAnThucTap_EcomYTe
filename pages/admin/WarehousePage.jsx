import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './WarehousePage.css';

const WarehousePage = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // Lưu ID nếu đang ở chế độ sửa
    const [formData, setFormData] = useState({
        name: '',
        type: 'main',
        address: '',
        status: 'active'
    });

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/warehouses');
            if (response.data.success) {
                setWarehouses(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu kho hàng từ máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    // Đóng Modal và reset form
    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', type: 'main', address: '', status: 'active' });
    };

    // Mở Modal cho Thêm mới
    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ name: '', type: 'main', address: '', status: 'active' });
        setShowModal(true);
    };

    // Mở Modal cho Chỉnh sửa
    const handleShowEdit = (warehouse) => {
        setEditingId(warehouse.id);
        setFormData({
            name: warehouse.name,
            type: warehouse.type,
            address: warehouse.address || '',
            status: warehouse.status
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gộp chung xử lý Thêm và Sửa
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Chế độ sửa
                await api.put(`/warehouses/${editingId}`, formData);
            } else {
                // Chế độ thêm mới
                await api.post('/warehouses', formData);
            }
            fetchWarehouses(); 
            handleClose();
        } catch (err) {
            alert('Đã xảy ra lỗi khi lưu thông tin.');
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa kho hàng này không? Dữ liệu liên quan có thể bị ảnh hưởng.')) {
            try {
                const response = await api.delete(`/warehouses/${id}`);
                if (response.data.success) {
                    fetchWarehouses();
                }
            } catch (err) {
                alert('Không thể xóa. Kho hàng này có thể đang chứa dữ liệu lưu trữ.');
            }
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="warehouse-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0 warehouse-title">Danh sách Kho hàng</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Thêm kho mới</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Tên kho</th>
                        <th>Loại kho</th>
                        <th>Địa chỉ</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {warehouses.length === 0 ? (
                        <tr><td colSpan="6" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        warehouses.map(w => (
                            <tr key={w.id}>
                                <td>{w.id}</td>
                                <td><strong>{w.name}</strong></td>
                                <td>{w.type === 'main' ? 'Kho chính' : 'Chi nhánh'}</td>
                                <td>{w.address}</td>
                                <td>
                                    <Badge bg={w.status === 'active' ? 'success' : 'secondary'}>
                                        {w.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(w)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(w.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Kho hàng' : 'Thêm Kho hàng mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên kho hàng <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phân loại</Form.Label>
                            <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                <option value="main">Kho chính</option>
                                <option value="branch">Kho chi nhánh</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ chi tiết</Form.Label>
                            <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái hoạt động</Form.Label>
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

export default WarehousePage;