import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsFilterRight } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State cho tìm kiếm và bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Khai báo formData đầy đủ các trường, khởi tạo bằng chuỗi rỗng để tránh lỗi React Uncontrolled
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        distributor_id: '',
        price: '',
        status: 'active'
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // State chứa link ảnh để hiển thị xem trước

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

    const isFiltering = searchTerm !== '' || filterCategory !== '' || filterStatus !== '';

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === '' || p.category_id?.toString() === filterCategory;
        const matchStatus = filterStatus === '' 
            ? true 
            : filterStatus === 'active' 
                ? p.status === 'active' 
                : p.status !== 'active';

        return matchSearch && matchCategory && matchStatus;
    });

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', category_id: '', distributor_id: '', price: '', status: 'active' });
        setImageFile(null);
        setPreviewImage(null);
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ 
            name: '', 
            category_id: categories.length > 0 ? categories[0].id : '', 
            distributor_id: distributors.length > 0 ? distributors[0].id : '', 
            price: '', 
            status: 'active' 
        });
        setImageFile(null);
        setPreviewImage(null);
        setShowModal(true);
    };

    const handleShowEdit = (prod) => {
        setEditingId(prod.id);
        setFormData({
            name: prod.name || '',
            category_id: prod.category_id || '',
            distributor_id: prod.distributor_id || '',
            price: prod.price || '',
            status: prod.status || 'active'
        });
        setImageFile(null);
        // Nếu sản phẩm đang sửa có sẵn ảnh cũ, thì hiển thị nó lên
        setPreviewImage(prod.image_url || null); 
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý sự kiện khi chọn file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Tạo link tạm để xem trước ảnh
        } else {
            setImageFile(null);
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('category_id', formData.category_id);
        dataToSend.append('distributor_id', formData.distributor_id);
        dataToSend.append('price', formData.price);
        dataToSend.append('status', formData.status);
        
        if (imageFile) {
            dataToSend.append('image', imageFile);
        }

        try {
            if (editingId) {
                // Đang sửa sản phẩm cũ
                await api.put(`/products/${editingId}`, dataToSend);
            } else {
                // Thêm sản phẩm mới
                await api.post('/products', dataToSend);
            }
            
            fetchData(); // Load lại bảng
            handleClose(); // Đóng modal và reset
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

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

    return (
        <div className="admin-page-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Sản phẩm</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredProducts.length} kết quả phù hợp` 
                            : `Tổng cộng ${products.length} sản phẩm trong hệ thống`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsPlusLg /> Thêm sản phẩm
                </Button>
            </div>

            <div className="table-toolbar">
                <Row className="g-3 align-items-center">
                    <Col md={5}>
                        <InputGroup className="shadow-sm">
                            <Form.Control 
                                placeholder="Nhập tên sản phẩm để tìm kiếm..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-end-0"
                            />
                            <Button variant="success" className="d-flex align-items-center px-3 z-0">
                                <BsSearch size={16} />
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select className="shadow-sm border-0" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="">Tất cả danh mục</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select className="shadow-sm border-0" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã ẩn / Ngừng bán</option>
                        </Form.Select>
                    </Col>
                    <Col md={1} className="d-flex justify-content-end">
                        <BsFilterRight size={28} className="text-secondary" title="Công cụ lọc" />
                    </Col>
                </Row>
            </div>

            <Table responsive hover className="custom-table border-0 shadow-sm">
                <thead>
                    <tr>
                        <th style={{ width: '80px' }} className="ps-4">Ảnh</th>
                        <th>Thông tin sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Trạng thái</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy sản phẩm nào khớp với điều kiện lọc</td></tr>
                    ) : (
                        filteredProducts.map(p => (
                            <tr key={p.id}>
                                <td className="ps-4">
                                    <img 
                                        src={p.image_url || 'https://via.placeholder.com/50'} 
                                        alt={p.name} 
                                        className="rounded shadow-sm border"
                                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{p.name}</div>
                                    <small className="text-muted">Mã SP: #{p.id}</small>
                                </td>
                                <td>{p.category_name || <span className="text-muted small">Chưa phân loại</span>}</td>
                                <td>
                                    <span className="fw-bold text-danger">
                                        {Number(p.price).toLocaleString('vi-VN')} đ
                                    </span>
                                </td>
                                <td>
                                    <Badge bg={p.status === 'active' ? 'success' : 'secondary'} className="px-3 py-2 fw-medium">
                                        {p.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                                    </Badge>
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(p)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(p.id)}>
                                        <BsTrash size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static" size="lg" className="custom-modal" centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Vitamin C 500mg" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Danh mục</Form.Label>
                                    <Form.Select name="category_id" value={formData.category_id} onChange={handleChange}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Nhà phân phối</Form.Label>
                                    <Form.Select name="distributor_id" value={formData.distributor_id} onChange={handleChange}>
                                        <option value="">-- Chọn nhà phân phối --</option>
                                        {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Giá bán (VNĐ) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required min="0" placeholder="0" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Trạng thái kinh doanh</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Ngừng bán / Đã ẩn</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-0">
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Hình ảnh Sản phẩm</Form.Label>
                                    {/* Không để value ở đây */}
                                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                                    
                                    {/* Hiển thị ảnh xem trước */}
                                    {previewImage && (
                                        <div className="mt-3 text-center bg-light p-2 rounded border">
                                            <img src={previewImage} alt="Preview" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                                        </div>
                                    )}
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

export default ProductPage;