import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsFilterRight } from 'react-icons/bs';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const backendUrl = 'http://localhost:5000';
const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}${url}`;
};

const ProductPage = () => {
    const { user } = useAuth(); // Lấy thông tin user để phân quyền xóa
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    // State cho Modal Thêm/Sửa
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // State cho Modal Xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        distributor_id: '',
        manufacturer: '',
        price: '',
        status: 'active',
        description: 'Công dụng: \nThành phần: \nThương hiệu: \nHạn dùng: '
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); 

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
        setFormData({ 
            name: '', category_id: '', distributor_id: '', manufacturer: '', 
            price: '', status: 'active', description: 'Công dụng: \nThành phần: \nThương hiệu: \nHạn dùng: ' 
        });
        setImageFile(null);
        setPreviewImage(null);
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ 
            name: '', 
            category_id: categories.length > 0 ? categories[0].id : '', 
            distributor_id: distributors.length > 0 ? distributors[0].id : '', 
            manufacturer: '',
            price: '', 
            status: 'active',
            description: 'Công dụng: \nThành phần: \nThương hiệu: \nHạn dùng: '
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
            manufacturer: prod.manufacturer || '',
            price: prod.price || '',
            // SỬA DÒNG NÀY: Gom chung 'hidden' và 'inactive' lại để Form nhận diện được
            status: (prod.status === 'hidden' ? 'inactive' : prod.status) || 'active',
            description: prod.description || ''
        });
        setImageFile(null);
        setPreviewImage(prod.image_url ? getImageUrl(prod.image_url) : null); 
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file)); 
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
        dataToSend.append('manufacturer', formData.manufacturer);
        dataToSend.append('price', formData.price);
        dataToSend.append('status', formData.status);
        dataToSend.append('description', formData.description);
        
        if (imageFile) {
            dataToSend.append('image', imageFile);
        }

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, dataToSend);
            } else {
                await api.post('/products', dataToSend);
            }
            fetchData(); 
            handleClose(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin.');
        }
    };

    // Hàm gọi API xóa (force = true là xóa cứng, false là ẩn)
    const confirmDelete = async (force) => {
        try {
            const response = await api.delete(`/products/${productToDelete.id}?force=${force}`);
            if (response.data.success) {
                fetchData();
                setShowDeleteModal(false);
                setProductToDelete(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xử lý yêu cầu.');
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
                        <th className="text-center">Tồn kho</th>
                        <th>Trạng thái</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-5 text-muted">Không tìm thấy sản phẩm nào khớp với điều kiện lọc</td></tr>
                    ) : (
                        filteredProducts.map(p => (
                            <tr key={p.id} className={p.status === 'hidden' ? 'bg-light opacity-50' : ''}>
                                <td className="ps-4">
                                    <img 
                                        src={getImageUrl(p.image_url)} 
                                        alt={p.name} 
                                        className="rounded shadow-sm border bg-white"
                                        style={{ width: '45px', height: '45px', objectFit: 'contain' }}
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
                                <td className="text-center">
                                    <span className="fw-bold fs-6 text-primary">{p.total_stock || 0}</span>
                                </td>
                                <td>
                                    {p.status === 'inactive' || p.status === 'hidden' ? (
                                        <Badge bg="secondary" className="px-3 py-2 fw-medium">Ngừng kinh doanh</Badge>
                                    ) : parseInt(p.total_stock) > 0 ? (
                                        <Badge bg="success" className="px-3 py-2 fw-medium">Còn hàng</Badge>
                                    ) : (
                                        <Badge bg="danger" className="px-3 py-2 fw-medium">Hết hàng</Badge>
                                    )}
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(p)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" 
                                        onClick={() => { setProductToDelete(p); setShowDeleteModal(true); }}>
                                        <BsTrash size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* MODAL THÊM SỬA SẢN PHẨM */}
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
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Nhà phân phối (Nội bộ)</Form.Label>
                                    <Form.Select name="distributor_id" value={formData.distributor_id} onChange={handleChange}>
                                        <option value="">-- Chọn nhà phân phối --</option>
                                        {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Nhà sản xuất (Khách xem)</Form.Label>
                                    <Form.Control type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Ví dụ: Pfizer, Sanofi..." />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Giá bán (VNĐ) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required min="0" placeholder="0" />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Trạng thái Web</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">Đang kinh doanh</option>
                                        <option value="inactive">Ngừng kinh doanh</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Mô tả sản phẩm chi tiết</Form.Label>
                                    <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} placeholder="Nhập thông tin chi tiết, công dụng, thành phần..." />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-0">
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Hình ảnh Sản phẩm</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
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

            {/* MODAL TÙY CHỌN XÓA (MỚI THÊM) */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="custom-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5 text-danger">Tùy chọn gỡ sản phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 px-4 pb-4">
                    <p className="text-muted">Bạn muốn xử lý sản phẩm <strong>{productToDelete?.name}</strong> như thế nào?</p>
                    
                    <div className="d-grid gap-3 mt-4">
                        <Button variant="outline-secondary" onClick={() => confirmDelete(false)} className="text-start p-3 border-2 rounded-3 hover-bg-light">
                            <div className="d-flex align-items-center mb-1">
                                <span className="fs-5 me-2">👀</span>
                                <span className="fw-bold text-dark fs-6">Ẩn sản phẩm (Khuyên dùng)</span>
                            </div>
                            <div className="small text-muted ms-4 ps-2">Sản phẩm sẽ biến mất khỏi trang mua hàng nhưng vẫn giữ lại để không làm hỏng lịch sử hóa đơn cũ của khách.</div>
                        </Button>
                        
                        {user?.role === 'admin' && (
                            <Button variant="outline-danger" onClick={() => confirmDelete(true)} className="text-start p-3 border-2 rounded-3">
                                <div className="d-flex align-items-center mb-1">
                                    <span className="fs-5 me-2">🗑️</span>
                                    <span className="fw-bold fs-6">Xóa vĩnh viễn</span>
                                </div>
                                <div className="small ms-4 ps-2 text-danger opacity-75">Chỉ dùng để xóa các dữ liệu rác. Hệ thống sẽ chặn nếu sản phẩm này đã từng được khách mua.</div>
                            </Button>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ProductPage;