import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsFilterRight, BsGeoAlt } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css';

const LocationPage = () => {
    // 1. STATE GỐC
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Thêm State cho công cụ Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWarehouse, setFilterWarehouse] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        warehouse_id: '',
        zone: '',
        shelf: ''
    });

    // 2. LOGIC FETCH DỮ LIỆU
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

    // 3. LOGIC BỘ LỌC TÍCH HỢP
    const isFiltering = searchTerm !== '' || filterWarehouse !== '';
    const filteredLocations = locations.filter(loc => {
        const searchStr = searchTerm.toLowerCase();
        // Tìm theo tên kho, khu vực (zone) hoặc dãy kệ (shelf)
        const matchSearch = 
            (loc.warehouse_name && loc.warehouse_name.toLowerCase().includes(searchStr)) ||
            (loc.zone && loc.zone.toLowerCase().includes(searchStr)) ||
            (loc.shelf && loc.shelf.toLowerCase().includes(searchStr));

        const matchWarehouse = filterWarehouse === '' || loc.warehouse_id?.toString() === filterWarehouse;

        return matchSearch && matchWarehouse;
    });

    // 4. CÁC HÀM XỬ LÝ SỰ KIỆN
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

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            {/* Tiêu đề trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Vị trí lưu trữ</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredLocations.length} vị trí phù hợp` 
                            : `Tổng cộng ${locations.length} vị trí lưu trữ được thiết lập`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsPlusLg /> Thêm vị trí mới
                </Button>
            </div>

            {/* Thanh công cụ Tìm kiếm & Lọc */}
            <div className="table-toolbar">
                <Row className="g-3 align-items-center w-100">
                    <Col md={6}>
                        <InputGroup className="shadow-sm border-0">
                            <Form.Control 
                                placeholder="Tìm kiếm theo khu vực, dãy kệ hoặc tên kho..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-end-0"
                            />
                            <Button variant="success" className="d-flex align-items-center px-3 z-0">
                                <BsSearch size={16} />
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col md={5}>
                        <Form.Select 
                            className="shadow-sm border-0"
                            value={filterWarehouse}
                            onChange={(e) => setFilterWarehouse(e.target.value)}
                        >
                            <option value="">Tất cả kho hàng</option>
                            {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
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
                        <th className="ps-4" style={{ width: '80px' }}>ID</th>
                        <th>Trực thuộc Cơ sở / Kho hàng</th>
                        <th>Khu vực (Zone)</th>
                        <th>Dãy kệ (Shelf)</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLocations.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy vị trí lưu trữ nào khớp với điều kiện lọc</td></tr>
                    ) : (
                        filteredLocations.map(loc => (
                            <tr key={loc.id}>
                                <td className="ps-4 text-muted">#{loc.id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3 text-secondary border">
                                            <BsGeoAlt size={18} />
                                        </div>
                                        <strong className="text-dark">{loc.warehouse_name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="info" className="text-dark bg-opacity-25 px-3 py-2 fw-bold border border-info">
                                        Khu {loc.zone}
                                    </Badge>
                                </td>
                                <td>
                                    {loc.shelf ? (
                                        <span className="fw-medium text-dark">Kệ {loc.shelf}</span>
                                    ) : (
                                        <span className="text-muted small italic">Chưa xác định</span>
                                    )}
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(loc)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(loc.id)}>
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
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Vị trí lưu trữ' : 'Thêm Vị trí lưu trữ mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Chọn Cơ sở / Kho hàng <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="warehouse_id" value={formData.warehouse_id} onChange={handleChange} required>
                                        <option value="">-- Chọn Kho hàng --</option>
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Khu vực (Zone) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="zone" value={formData.zone} onChange={handleChange} required placeholder="Ví dụ: A, B, Tầng 1..." />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Dãy kệ (Shelf)</Form.Label>
                                    <Form.Control type="text" name="shelf" value={formData.shelf} onChange={handleChange} placeholder="Ví dụ: Kệ 01, Kệ 02..." />
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

export default LocationPage;