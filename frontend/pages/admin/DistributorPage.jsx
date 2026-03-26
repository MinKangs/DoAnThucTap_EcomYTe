import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsBuildings } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css';

const DistributorPage = () => {
    // 1. STATE GỐC
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Thêm State cho công cụ Tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        tax_code: '',
        address: '',
        phone: ''
    });

    // 2. LOGIC FETCH DỮ LIỆU
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

    // 3. LOGIC BỘ LỌC TÍCH HỢP
    const isFiltering = searchTerm !== '';
    const filteredDistributors = distributors.filter(d => {
        const searchStr = searchTerm.toLowerCase();
        // Tìm kiếm theo tên, mã số thuế, số điện thoại hoặc địa chỉ
        return (
            d.name.toLowerCase().includes(searchStr) ||
            (d.tax_code && d.tax_code.toLowerCase().includes(searchStr)) ||
            (d.phone && d.phone.toLowerCase().includes(searchStr)) ||
            (d.address && d.address.toLowerCase().includes(searchStr))
        );
    });

    // 4. CÁC HÀM XỬ LÝ SỰ KIỆN
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

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            {/* Tiêu đề trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Nhà phân phối</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredDistributors.length} nhà phân phối phù hợp` 
                            : `Tổng cộng ${distributors.length} đối tác cung cấp trong hệ thống`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsPlusLg /> Thêm nhà phân phối
                </Button>
            </div>

            {/* Thanh công cụ Tìm kiếm */}
            <div className="table-toolbar">
                <Row className="g-3 align-items-center w-100">
                    <Col md={7}>
                        <InputGroup className="shadow-sm border-0">
                            <Form.Control 
                                placeholder="Tìm kiếm theo tên, mã số thuế, số điện thoại hoặc địa chỉ..." 
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
                        <th>Tên nhà phân phối</th>
                        <th>Thông tin liên hệ</th>
                        <th>Mã số thuế</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDistributors.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy đối tác nào khớp với điều kiện tìm kiếm</td></tr>
                    ) : (
                        filteredDistributors.map(d => (
                            <tr key={d.id}>
                                <td className="ps-4 text-muted">#{d.id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3 text-secondary border">
                                            <BsBuildings size={18} />
                                        </div>
                                        <strong className="text-dark">{d.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-medium text-dark">{d.phone || <span className="text-muted small italic">Chưa có SĐT</span>}</div>
                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: '250px' }} title={d.address}>
                                        {d.address || 'Chưa có địa chỉ'}
                                    </small>
                                </td>
                                <td>
                                    {d.tax_code ? (
                                        <span className="fw-medium">{d.tax_code}</span>
                                    ) : (
                                        <span className="text-muted small italic">Chưa cập nhật</span>
                                    )}
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(d)}>
                                        <BsPencilSquare size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(d.id)}>
                                        <BsTrash size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Form */}
            <Modal show={showModal} onHide={handleClose} backdrop="static" className="custom-modal" size="lg" centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Nhà phân phối' : 'Thêm Nhà phân phối mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Tên nhà phân phối <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Công ty Dược phẩm Trung Ương 1" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Mã số thuế</Form.Label>
                                    <Form.Control type="text" name="tax_code" value={formData.tax_code} onChange={handleChange} placeholder="Nhập mã số thuế doanh nghiệp..." />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Số điện thoại liên hệ</Form.Label>
                                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại..." />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-0">
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Địa chỉ trụ sở</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ đầy đủ của đối tác..." />
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

export default DistributorPage;