import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Spinner, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsFilterRight, BsBuilding } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css';

const WarehousePage = () => {
    // 1. STATE GỐC
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'main',
        address: '',
        status: 'active'
    });

    // Thêm State cho công cụ Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // 2. LOGIC FETCH DỮ LIỆU
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

    // 3. LOGIC BỘ LỌC TÍCH HỢP
    const isFiltering = searchTerm !== '' || filterType !== '' || filterStatus !== '';
    const filteredWarehouses = warehouses.filter(w => {
        const searchStr = searchTerm.toLowerCase();
        const matchSearch = 
            w.name.toLowerCase().includes(searchStr) || 
            (w.address && w.address.toLowerCase().includes(searchStr));
            
        const matchType = filterType === '' || w.type === filterType;
        const matchStatus = filterStatus === '' || w.status === filterStatus;

        return matchSearch && matchType && matchStatus;
    });

    // 4. CÁC HÀM XỬ LÝ SỰ KIỆN
    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', type: 'main', address: '', status: 'active' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ name: '', type: 'main', address: '', status: 'active' });
        setShowModal(true);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/warehouses/${editingId}`, formData);
            } else {
                await api.post('/warehouses', formData);
            }
            fetchWarehouses(); 
            handleClose();
        } catch (err) {
            alert('Đã xảy ra lỗi khi lưu thông tin.');
        }
    };

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

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            {/* Tiêu đề trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Kho hàng</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredWarehouses.length} kết quả phù hợp` 
                            : `Tổng cộng ${warehouses.length} cơ sở lưu trữ trong hệ thống`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsPlusLg /> Thêm kho mới
                </Button>
            </div>

            {/* Thanh công cụ Tìm kiếm & Lọc */}
            <div className="table-toolbar">
                <Row className="g-3 align-items-center">
                    <Col md={5}>
                        <InputGroup className="shadow-sm">
                            <Form.Control 
                                placeholder="Tìm kiếm theo tên kho hoặc địa chỉ..." 
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
                        <Form.Select 
                            className="shadow-sm border-0"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">Tất cả phân loại</option>
                            <option value="main">Kho chính</option>
                            <option value="branch">Kho chi nhánh</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select 
                            className="shadow-sm border-0"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Tạm ngưng</option>
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
                        <th className="ps-4">Tên cơ sở</th>
                        <th>Phân loại</th>
                        <th>Địa chỉ chi tiết</th>
                        <th>Trạng thái</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWarehouses.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy cơ sở nào khớp với điều kiện lọc</td></tr>
                    ) : (
                        filteredWarehouses.map(w => (
                            <tr key={w.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3 text-secondary border">
                                            <BsBuilding size={20} />
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{w.name}</div>
                                            <small className="text-muted">Mã Kho: #{w.id}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {w.type === 'main' 
                                        ? <Badge bg="primary" className="fw-medium bg-opacity-75">Kho chính</Badge> 
                                        : <Badge bg="info" className="fw-medium text-dark bg-opacity-75">Chi nhánh</Badge>}
                                </td>
                                <td style={{ maxWidth: '300px' }}>
                                    <span className="text-truncate d-block" title={w.address}>{w.address || 'Chưa cập nhật'}</span>
                                </td>
                                <td>
                                    <Badge bg={w.status === 'active' ? 'success' : 'secondary'} className="px-3 py-2 fw-medium">
                                        {w.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </Badge>
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(w)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(w.id)}>
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
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Kho hàng' : 'Thêm Cơ sở lưu trữ mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Tên kho hàng <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Kho Tổng Miền Nam" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Phân loại</Form.Label>
                                    <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                        <option value="main">Kho chính</option>
                                        <option value="branch">Kho chi nhánh</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Địa chỉ chi tiết</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ đầy đủ..." />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-0">
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Trạng thái hoạt động</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Tạm ngưng</option>
                                    </Form.Select>
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

export default WarehousePage;