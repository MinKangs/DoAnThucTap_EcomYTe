import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsFilterRight, BsBoxArrowInRight } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css'; // Kế thừa CSS dùng chung

const InventoryPage = () => {
    // 1. GIỮ NGUYÊN STATE GỐC
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Thêm State cho công cụ Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

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

    // 2. GIỮ NGUYÊN LOGIC FETCH DỮ LIỆU
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

    // Các hàm kiểm tra hạn sử dụng
    const isExpiringSoon = (dateString) => {
        if (!dateString) return false;
        const expDate = new Date(dateString);
        const today = new Date();
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    };

    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    // 3. LOGIC BỘ LỌC TÍCH HỢP
    const isFiltering = searchTerm !== '' || filterStatus !== '';
    const filteredBatches = batches.filter(b => {
        const searchStr = searchTerm.toLowerCase();
        // Tìm theo Số lô hoặc Tên sản phẩm
        const matchSearch = 
            (b.batch_number && b.batch_number.toLowerCase().includes(searchStr)) ||
            (b.product_name && b.product_name.toLowerCase().includes(searchStr));

        // Lọc theo trạng thái Date thuốc
        let matchStatus = true;
        if (filterStatus === 'expired') matchStatus = isExpired(b.expiration_date);
        else if (filterStatus === 'expiring_soon') matchStatus = isExpiringSoon(b.expiration_date);
        else if (filterStatus === 'valid') matchStatus = !isExpired(b.expiration_date) && !isExpiringSoon(b.expiration_date);

        return matchSearch && matchStatus;
    });

    // 4. GIỮ NGUYÊN CÁC HÀM XỬ LÝ SỰ KIỆN
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
            import_date: new Date().toISOString().split('T')[0],
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

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            {/* Tiêu đề trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Nhập kho & Lô hàng</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredBatches.length} lô hàng phù hợp` 
                            : `Có tất cả ${batches.length} lô hàng trong hệ thống`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsBoxArrowInRight size={18} /> Nhập kho mới
                </Button>
            </div>

            {/* Thanh công cụ Tìm kiếm & Lọc */}
            <div className="table-toolbar">
                <Row className="g-3 align-items-center">
                    <Col md={7}>
                        <InputGroup className="shadow-sm">
                            <Form.Control 
                                placeholder="Tìm kiếm theo mã lô (Batch Number) hoặc tên sản phẩm..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-end-0"
                            />
                            <Button variant="success" className="d-flex align-items-center px-3 z-0">
                                <BsSearch size={16} />
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select 
                            className="shadow-sm border-0"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả tình trạng (Date)</option>
                            <option value="valid">Bình thường (Date xa)</option>
                            <option value="expiring_soon">Sắp hết hạn (&lt; 30 ngày)</option>
                            <option value="expired">Đã hết hạn</option>
                        </Form.Select>
                    </Col>
                    <Col md={1} className="d-flex justify-content-end">
                        <BsFilterRight size={28} className="text-secondary" title="Công cụ lọc" />
                    </Col>
                </Row>
            </div>

            {/* Bảng dữ liệu */}
            <Table responsive hover className="custom-table border-0 shadow-sm">
                <thead>
                    <tr>
                        <th className="ps-4">Mã lô (Batch)</th>
                        <th>Sản phẩm</th>
                        <th className="text-center">Số lượng</th>
                        <th>Vị trí xếp hàng</th>
                        <th>Ngày nhập</th>
                        <th>Hạn sử dụng (Date)</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBatches.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-5 text-muted">Không tìm thấy lô hàng nào khớp với điều kiện lọc</td></tr>
                    ) : (
                        filteredBatches.map(b => (
                            <tr key={b.id}>
                                <td className="ps-4">
                                    <strong className="text-primary">{b.batch_number}</strong>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{b.product_name}</div>
                                </td>
                                <td className="text-center">
                                    <span className="fw-bold fs-6">{b.quantity}</span>
                                </td>
                                <td>
                                    {b.warehouse_name ? (
                                        <>
                                            <div className="fw-medium text-dark">{b.warehouse_name}</div>
                                            <small className="text-muted">Khu {b.zone} {b.shelf ? `- Kệ ${b.shelf}` : ''}</small>
                                        </>
                                    ) : (
                                        <span className="text-muted italic">Chưa xếp vị trí</span>
                                    )}
                                </td>
                                <td>{new Date(b.import_date).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <span className="me-2 fw-medium text-dark">{new Date(b.expiration_date).toLocaleDateString('vi-VN')}</span>
                                    {isExpired(b.expiration_date) ? (
                                        <Badge bg="danger" className="fw-medium">Hết hạn</Badge>
                                    ) : isExpiringSoon(b.expiration_date) ? (
                                        <Badge bg="warning" text="dark" className="fw-medium">Sắp hết hạn</Badge>
                                    ) : (
                                        <Badge bg="success" className="fw-medium bg-opacity-75">Tốt</Badge>
                                    )}
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(b)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(b.id)}>
                                        <BsTrash size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Form */}
            <Modal show={showModal} onHide={handleClose} backdrop="static" size="lg" className="custom-modal" centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Lô hàng' : 'Thêm Lô hàng mới (Nhập kho)'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Sản phẩm <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="product_id" value={formData.product_id} onChange={handleChange} required disabled={!!editingId}>
                                        <option value="">-- Chọn sản phẩm cần nhập --</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Mã Lô (Batch Number) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} required placeholder="VD: LOT202310" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Số lượng nhập <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" placeholder="0" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Vị trí lưu trữ <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="location_id" value={formData.location_id} onChange={handleChange} required>
                                        <option value="">-- Chọn vị trí xếp hàng --</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.warehouse_name} - Khu vực: {loc.zone} {loc.shelf ? `(Kệ ${loc.shelf})` : ''}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Ngày nhập kho <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="import_date" value={formData.import_date} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Hạn sử dụng (Date) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} required />
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

export default InventoryPage;