import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './DistributorPage.css';

const DistributorPage = () => {
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        tax_code: '',
        address: '',
        phone: ''
    });

    const fetchDistributors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/distributors');
            if (response.data.success) {
                setDistributors(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu nhà phân phối từ máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDistributors();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', tax_code: '', address: '', phone: '' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ name: '', tax_code: '', address: '', phone: '' });
        setShowModal(true);
    };

    const handleShowEdit = (distributor) => {
        setEditingId(distributor.id);
        setFormData({
            name: distributor.name,
            tax_code: distributor.tax_code || '',
            address: distributor.address || '',
            phone: distributor.phone || ''
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
                await api.put(`/distributors/${editingId}`, formData);
            } else {
                await api.post('/distributors', formData);
            }
            fetchDistributors(); 
            handleClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin.';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhà phân phối này không?')) {
            try {
                const response = await api.delete(`/distributors/${id}`);
                if (response.data.success) fetchDistributors();
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Không thể xóa nhà phân phối này.';
                alert(errorMsg);
            }
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="distributor-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0 distributor-title">Quản lý Nhà phân phối</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Thêm nhà phân phối</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Tên nhà phân phối</th>
                        <th>Mã số thuế</th>
                        <th>Số điện thoại</th>
                        <th>Địa chỉ</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {distributors.length === 0 ? (
                        <tr><td colSpan="6" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        distributors.map(d => (
                            <tr key={d.id}>
                                <td>{d.id}</td>
                                <td><strong>{d.name}</strong></td>
                                <td>{d.tax_code}</td>
                                <td>{d.phone}</td>
                                <td>{d.address}</td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(d)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(d.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Nhà phân phối' : 'Thêm Nhà phân phối mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên nhà phân phối <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mã số thuế</Form.Label>
                            <Form.Control type="text" name="tax_code" value={formData.tax_code} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} />
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

export default DistributorPage;