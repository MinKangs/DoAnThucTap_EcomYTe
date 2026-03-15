import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './CategoryPage.css';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu danh mục từ máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', description: '' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const handleShowEdit = (category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            description: category.description || ''
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
                await api.put(`/categories/${editingId}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            fetchCategories(); 
            handleClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin.';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
            try {
                const response = await api.delete(`/categories/${id}`);
                if (response.data.success) fetchCategories();
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Không thể xóa danh mục này.';
                alert(errorMsg);
            }
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="category-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0 category-title">Quản lý Danh mục sản phẩm</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Thêm danh mục</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th style={{ width: '10%' }}>ID</th>
                        <th style={{ width: '30%' }}>Tên danh mục</th>
                        <th style={{ width: '40%' }}>Mô tả</th>
                        <th className="text-center" style={{ width: '20%' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 ? (
                        <tr><td colSpan="4" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        categories.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td><strong>{c.name}</strong></td>
                                <td>{c.description}</td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(c)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.id)}>Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên danh mục <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả chi tiết</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
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

export default CategoryPage;