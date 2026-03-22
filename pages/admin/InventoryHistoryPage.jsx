import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Badge, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { BsSearch, BsFilterRight, BsClockHistory } from 'react-icons/bs';
import api from '../../services/api';
import './AdminCommon.css';

const InventoryHistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get('/inventory/transactions');
                if (response.data.success) {
                    setTransactions(response.data.data);
                }
            } catch (err) {
                setError('Không thể tải dữ liệu lịch sử kho.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const isFiltering = searchTerm !== '' || filterType !== '';
    const filteredTransactions = transactions.filter(t => {
        const searchStr = searchTerm.toLowerCase();
        const matchSearch = 
            (t.product_name && t.product_name.toLowerCase().includes(searchStr)) ||
            (t.batch_number && t.batch_number.toLowerCase().includes(searchStr)) ||
            (t.note && t.note.toLowerCase().includes(searchStr));
            
        const matchType = filterType === '' || t.transaction_type === filterType;
        
        return matchSearch && matchType;
    });

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <div className="admin-page-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-header-title m-0 d-flex align-items-center">
                        <BsClockHistory className="me-2 text-primary" /> Lịch sử Nhập - Xuất kho
                    </h2>
                    <p className="text-muted small m-0 mt-1">
                        {isFiltering 
                            ? `Tìm thấy ${filteredTransactions.length} giao dịch phù hợp` 
                            : `Hệ thống ghi nhận tổng cộng ${transactions.length} giao dịch`}
                    </p>
                </div>
            </div>

            <div className="table-toolbar">
                <Row className="g-3 align-items-center">
                    <Col md={7}>
                        <InputGroup className="shadow-sm">
                            <Form.Control 
                                placeholder="Tìm kiếm theo mã lô, tên sản phẩm hoặc ghi chú..." 
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
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">Tất cả loại giao dịch</option>
                            <option value="import">Nhập kho (Import)</option>
                            <option value="export">Xuất kho (Export)</option>
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
                        <th className="ps-4">Thời gian</th>
                        <th>Loại giao dịch</th>
                        <th>Sản phẩm / Mã lô</th>
                        <th className="text-center">Số lượng</th>
                        <th>Kho hàng</th>
                        <th>Nội dung (Ghi chú)</th>
                        <th>Người thực hiện</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-5 text-muted">Không có dữ liệu lịch sử nào</td></tr>
                    ) : (
                        filteredTransactions.map(t => (
                            <tr key={t.id}>
                                <td className="ps-4 text-muted">
                                    <div className="fw-medium text-dark">{new Date(t.created_at).toLocaleDateString('vi-VN')}</div>
                                    <small>{new Date(t.created_at).toLocaleTimeString('vi-VN')}</small>
                                </td>
                                <td>
                                    {t.transaction_type === 'import' ? (
                                        <Badge bg="success" className="px-3 py-2 fw-medium">Nhập kho</Badge>
                                    ) : (
                                        <Badge bg="danger" className="px-3 py-2 fw-medium">Xuất bán</Badge>
                                    )}
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{t.product_name}</div>
                                    <small className="text-muted">Mã lô: {t.batch_number || 'N/A'}</small>
                                </td>
                                <td className="text-center">
                                    <span className={`fw-bold fs-6 ${t.transaction_type === 'import' ? 'text-success' : 'text-danger'}`}>
                                        {t.transaction_type === 'import' ? '+' : '-'}{t.quantity}
                                    </span>
                                </td>
                                <td>
                                    {t.warehouse_name || <span className="text-muted italic small">Không xác định</span>}
                                </td>
                                <td>
                                    <span className="text-muted">{t.note}</span>
                                </td>
                                <td>
                                    {t.created_by_name ? (
                                        <span className="fw-medium">{t.created_by_name}</span>
                                    ) : (
                                        <span className="text-muted small italic">Hệ thống / Khách hàng</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default InventoryHistoryPage;