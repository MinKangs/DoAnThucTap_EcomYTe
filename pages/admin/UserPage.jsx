import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsPlusLg, BsPencilSquare, BsTrash, BsFilterRight, BsPersonCircle, BsShieldLock, BsPersonBadge } from 'react-icons/bs';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Thêm dòng này
import './AdminCommon.css';

const UserPage = () => {
    const { user: currentUser } = useAuth(); // Lấy thông tin user hiện tại
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', password: '', role: 'user', status: 'active'
    });

    // Chặn ngay lập tức nếu không phải admin
    if (currentUser?.role !== 'admin') {
        return (
            <div className="admin-page-container mt-4">
                <Alert variant="danger" className="m-0 border-0 shadow-sm">
                    <h5 className="fw-bold mb-2">Truy cập bị từ chối</h5>
                    <p className="m-0">Tài khoản nhân viên không có thẩm quyền truy cập trang quản lý người dùng.</p>
                </Alert>
            </div>
        );
    }

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            if (response.data.success) setUsers(response.data.data);
        } catch (err) {
            setError('Không thể tải dữ liệu người dùng từ máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const isFiltering = searchTerm !== '' || filterRole !== '' || filterStatus !== '';
    const filteredUsers = users.filter(u => {
        const searchStr = searchTerm.toLowerCase();
        const matchSearch = 
            (u.full_name && u.full_name.toLowerCase().includes(searchStr)) ||
            (u.email && u.email.toLowerCase().includes(searchStr)) ||
            (u.phone && u.phone.includes(searchStr));
        const matchRole = filterRole === '' || u.role === filterRole;
        const matchStatus = filterStatus === '' || u.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
    });

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ full_name: '', email: '', phone: '', password: '', role: 'user', status: 'active' });
    };

    const handleShowAdd = () => {
        setEditingId(null);
        setFormData({ full_name: '', email: '', phone: '', password: '', role: 'user', status: 'active' });
        setShowModal(true);
    };

    const handleShowEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            full_name: user.full_name, email: user.email, phone: user.phone || '',
            password: '', role: user.role || 'user', status: user.status || 'active'
        });
        setShowModal(true);
    };
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData };
            if (editingId && !submitData.password) delete submitData.password;

            if (editingId) await api.put(`/users/${editingId}`, submitData);
            else await api.post('/users', submitData);
            
            fetchUsers(); 
            handleClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin người dùng.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn khóa/xóa tài khoản này không?')) {
            try {
                const response = await api.delete(`/users/${id}`);
                if (response.data.success) fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Không thể thao tác trên tài khoản này.');
            }
        }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0">Quản lý Tài khoản</h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering ? `Tìm thấy ${filteredUsers.length} tài khoản phù hợp` : `Tổng cộng ${users.length} tài khoản trong hệ thống`}
                    </p>
                </div>
                <Button variant="success" className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold" onClick={handleShowAdd}>
                    <BsPlusLg /> Thêm tài khoản
                </Button>
            </div>

            <div className="table-toolbar">
                <Row className="g-3 align-items-center w-100">
                    <Col md={5}>
                        <InputGroup className="shadow-sm border-0">
                            <Form.Control placeholder="Tìm kiếm theo tên, email hoặc SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-end-0" />
                            <Button variant="success" className="d-flex align-items-center px-3 z-0"><BsSearch size={16} /></Button>
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select className="shadow-sm border-0" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                            <option value="staff">Nhân viên (Staff)</option>
                            <option value="user">Khách hàng (User)</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select className="shadow-sm border-0" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã khóa</option>
                        </Form.Select>
                    </Col>
                    <Col md={1} className="d-flex justify-content-end"><BsFilterRight size={28} className="text-secondary" title="Công cụ lọc" /></Col>
                </Row>
            </div>

            <Table responsive hover className="custom-table border-0 shadow-sm">
                <thead>
                    <tr>
                        <th className="ps-4" style={{ width: '80px' }}>ID</th>
                        <th>Thông tin tài khoản</th>
                        <th>Liên hệ</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th className="text-center pe-4">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy tài khoản nào</td></tr>
                    ) : (
                        filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td className="ps-4 text-muted">#{u.id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-2 me-3 text-secondary border d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            {u.role === 'admin' ? <BsShieldLock size={18} className="text-danger" /> : 
                                             u.role === 'staff' ? <BsPersonBadge size={18} className="text-warning" /> : <BsPersonCircle size={18} />}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{u.full_name}</div>
                                            <small className="text-muted">{u.email}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>{u.phone ? <span className="fw-medium text-dark">{u.phone}</span> : <span className="text-muted small italic">Chưa cập nhật</span>}</td>
                                <td>
                                    {u.role === 'admin' ? (
                                        <Badge bg="danger" className="bg-opacity-75 px-3 py-2 fw-bold text-white border border-danger">Quản trị viên</Badge>
                                    ) : u.role === 'staff' ? (
                                        <Badge bg="warning" text="dark" className="bg-opacity-75 px-3 py-2 fw-bold border border-warning">Nhân viên</Badge>
                                    ) : (
                                        <Badge bg="info" className="bg-opacity-25 px-3 py-2 fw-medium text-dark border border-info">Khách hàng</Badge>
                                    )}
                                </td>
                                <td>
                                    <Badge bg={u.status === 'active' ? 'success' : 'secondary'} className="px-3 py-2 fw-medium">
                                        {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                    </Badge>
                                </td>
                                <td className="text-center pe-4">
                                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm btn-icon border" onClick={() => handleShowEdit(u)}><BsPencilSquare size={16} /></Button>
                                    <Button variant="light" size="sm" className="text-danger shadow-sm btn-icon border" onClick={() => handleDelete(u.id)}><BsTrash size={16} /></Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static" className="custom-modal" size="lg" centered>
                <Modal.Header closeButton className="px-4">
                    <Modal.Title className="fw-bold fs-5">{editingId ? 'Cập nhật Tài khoản' : 'Thêm Tài khoản mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Họ và tên <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Số điện thoại</Form.Label>
                                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Địa chỉ Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">
                                        Mật khẩu {editingId && <span className="text-secondary fw-normal text-lowercase">(Để trống nếu không muốn đổi)</span>}
                                        {!editingId && <span className="text-danger">*</span>}
                                    </Form.Label>
                                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required={!editingId} minLength="6" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Vai trò hệ thống</Form.Label>
                                    <Form.Select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="user">Khách hàng (User)</option>
                                        <option value="staff">Nhân viên (Staff)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Trạng thái tài khoản</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Tạm khóa / Vô hiệu hóa</option>
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

export default UserPage;