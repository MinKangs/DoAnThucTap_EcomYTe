import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import api from '../../services/api';
import './ProductPage.css';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        distributor_id: '',
        price: '',
        image_url: '',
        status: 'active'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, distRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories'),
                api.get('/distributors')
            ]);
            
            if (prodRes.data.success) setProducts(prodRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data);
            if (distRes.data.success) setDistributors(distRes.data.data);
            
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
        setFormData({ name: '', category_id: '', distributor_id: '', price: '', image_url: '', status: 'active' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ 
            name: '', 
            category_id: categories.length > 0 ? categories[0].id : '', 
            distributor_id: distributors.length > 0 ? distributors[0].id : '', 
            price: '', 
            image_url: '', 
            status: 'active' 
        });
        setShowModal(true);
    };

    const handleShowEdit = (prod) => {
        setEditingId(prod.id);
        setFormData({
            name: prod.name,
            category_id: prod.category_id || '',
            distributor_id: prod.distributor_id || '',
            price: prod.price,
            image_url: prod.image_url || '',
            status: prod.status || 'active'
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
                await api.put(`/products/${editingId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            fetchData(); 
            handleClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn ẩn/xóa sản phẩm này không?')) {
            try {
                const response = await api.delete(`/products/${id}`);
                if (response.data.success) fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Không thể xử lý yêu cầu.');
            }
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="product-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0">Quản lý Sản phẩm</h3>
                <Button variant="primary" onClick={handleShowAdd}>+ Thêm sản phẩm</Button>
            </div>

            <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr><td colSpan="7" className="text-center">Chưa có dữ liệu</td></tr>
                    ) : (
                        products.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} className="product-img-preview" />
                                    ) : (
                                        <div className="product-img-preview bg-light d-flex align-items-center justify-content-center text-muted" style={{fontSize: '10px'}}>No Image</div>
                                    )}
                                </td>
                                <td><strong>{p.name}</strong></td>
                                <td>{p.category_name || 'Không có'}</td>
                                <td>{Number(p.price).toLocaleString('vi-VN')} đ</td>
                                <td>
                                    <Badge bg={p.status === 'active' ? 'success' : 'secondary'}>
                                        {p.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleShowEdit(p)}>Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p.id)}>Ẩn/Xóa</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục</Form.Label>
                                    <Form.Select name="category_id" value={formData.category_id} onChange={handleChange}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nhà phân phối</Form.Label>
                                    <Form.Select name="distributor_id" value={formData.distributor_id} onChange={handleChange}>
                                        <option value="">-- Chọn nhà phân phối --</option>
                                        {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá bán (VNĐ) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Đã ẩn / Ngừng bán</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL Hình ảnh</Form.Label>
                                    <Form.Control type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
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

export default ProductPage;