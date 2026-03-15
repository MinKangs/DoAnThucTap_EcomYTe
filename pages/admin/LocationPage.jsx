import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './LocationPage.css';

const LocationPage = () => {
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        warehouse_id: '',
        zone: '',
        shelf: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [locRes, whRes] = await Promise.all([
                api.get('/locations'),
                api.get('/warehouses')
            ]);
            
            if (locRes.data.success) setLocations(locRes.data.data);
            if (whRes.data.success) {
                setWarehouses(whRes.data.data);
                if (whRes.data.data.length > 0 && !editingId) {
                    setFormData(prev => ({ ...prev, warehouse_id: whRes.data.data[0].id }));
                }
            }
        } catch (err) {
            setError('Không thể tải dữ liệu từ máy chủ.');
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
        setFormData({ warehouse_id: warehouses.length > 0 ? warehouses[0].id : '', zone: '', shelf: '' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ warehouse_id: warehouses.length > 0 ? warehouses[0].id : '', zone: '', shelf: '' });
        setShowModal(true);
    };

    const handleShowEdit = (loc) => {
        setEditingId(loc.id);
        setFormData({
            warehouse_id: loc.warehouse_id,
            zone: loc.zone,
            shelf: loc.shelf || ''
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
                await api.put(`/locations/${editingId}`, formData);
            } else {
                await api.post('/locations', formData);
            }
            fetchData(); 
            handleClose();
        } catch (err) {
            alert('Đã xảy ra lỗi khi lưu thông tin vị trí.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vị trí này không?')) {
            try {
                const response = await api.delete(`/locations/${id}`);
                if (response.data.success) fetchData();
            } catch (err) {
                alert('Không thể xóa vị trí lưu trữ này.');
            }
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="location-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0 location-title">Quản lý Vị trí lưu trữ</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Thêm vị trí mới</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Trực thuộc Kho</th>
                        <th>Khu vực (Zone)</th>
                        <th>Dãy kệ (Shelf)</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.length === 0 ? (
                        <tr><td colSpan="5" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        locations.map(loc => (
                            <tr key={loc.id}>
                                <td>{loc.id}</td>
                                <td><strong>{loc.warehouse_name}</strong></td>
                                <td>{loc.zone}</td>
                                <td>{loc.shelf}</td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(loc)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(loc.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Vị trí lưu trữ' : 'Thêm Vị trí lưu trữ mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Chọn Kho hàng <span className="text-danger">*</span></Form.Label>
                            <Form.Select name="warehouse_id" value={formData.warehouse_id} onChange={handleChange} required>
                                {warehouses.map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Khu vực (Zone) <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="zone" value={formData.zone} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dãy kệ (Shelf)</Form.Label>
                            <Form.Control type="text" name="shelf" value={formData.shelf} onChange={handleChange} />
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

export default LocationPage;