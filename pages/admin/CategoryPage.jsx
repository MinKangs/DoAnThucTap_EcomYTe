import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsListUl } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css';

const CategoryPage = () => {
    // 1. STATE GỐC
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Thêm State cho công cụ Tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // 2. LOGIC FETCH DỮ LIỆU
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

    // 3. LOGIC TÌM KIẾM
    const isFiltering = searchTerm !== '';
    const filteredCategories = categories.filter(c => {
        const searchStr = searchTerm.toLowerCase();
        return (
            c.name.toLowerCase().includes(searchStr) ||
            (c.description && c.description.toLowerCase().includes(searchStr))
        );
    });

    // 4. CÁC HÀM XỬ LÝ SỰ KIỆN
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

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            {/* Tiêu đề trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Danh mục sản phẩm</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredCategories.length} danh mục phù hợp` 
                            : `Tổng cộng ${categories.length} danh mục trong hệ thống`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsPlusLg /> Thêm danh mục
                </Button>
            </div>

            {/* Thanh công cụ Tìm kiếm */}
            <div className="table-toolbar">
                <Row className="g-3 align-items-center w-100">
                    <Col md={6}>
                        <InputGroup className="shadow-sm border-0">
                            <Form.Control 
                                placeholder="Tìm kiếm theo tên danh mục hoặc mô tả..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-end-0"
                            />
                            <Button variant="success" className="d-flex align-items-center px-3 z-0">
                                <BsSearch size={16} />
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
            </div>

            {/* Bảng dữ liệu */}
            <Table responsive hover className="custom-table border-0 shadow-sm">
                <thead>
                    <tr>
                        <th className="ps-4" style={{ width: '80px' }}>ID</th>
                        <th style={{ width: '30%' }}>Tên danh mục</th>
                        <th style={{ width: '45%' }}>Mô tả chi tiết</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-5 text-muted">Không tìm thấy danh mục nào khớp với điều kiện tìm kiếm</td></tr>
                    ) : (
                        filteredCategories.map(c => (
                            <tr key={c.id}>
                                <td className="ps-4 text-muted">#{c.id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3 text-secondary border">
                                            <BsListUl size={18} />
                                        </div>
                                        <strong className="text-dark">{c.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-muted">{c.description || <span className="italic small">Chưa cập nhật mô tả</span>}</span>
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(c)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(c.id)}>
                                        <BsTrash size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Form */}
            <Modal show={showModal} onHide={handleClose} backdrop="static" className="custom-modal" centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Tên danh mục <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Thực phẩm chức năng, Thiết bị y tế..." />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Mô tả chi tiết</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Nhập thông tin mô tả cho danh mục này..." />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0 gap-2">
                        <Button variant="light" className="px-4 fw-medium border shadow-sm" onClick={handleClose}>Hủy bỏ</Button>
                        <Button variant="success" className="px-5 fw-bold shadow-sm" type="submit">Lưu dữ liệu</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryPage;