import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Table } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const RevenueReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState('30days');

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        try {
            let query = '';
            const today = new Date();
            let startDate = new Date();

            if (dateRange === '7days') {
                startDate.setDate(today.getDate() - 7);
                query = `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
            } else if (dateRange === '30days') {
                startDate.setDate(today.getDate() - 30);
                query = `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
            } else if (dateRange === 'thisMonth') {
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                query = `?startDate=${startDate.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
            }

            const res = await api.get(`/reports/revenue${query}`);
            if (res.data.success) {
                setReportData(res.data.data);
            }
        } catch (error) {
            console.error('Lỗi tải báo cáo:', error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    };

    if (!reportData) return <div className="p-4">Đang tải dữ liệu báo cáo...</div>;

    const { summary, timeline, categories, topProducts } = reportData;

    return (
        <div className="admin-page-container p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark m-0">Báo Cáo Doanh Thu</h3>
                <Form.Select 
                    style={{ width: '200px' }} 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="7days">7 ngày qua</option>
                    <option value="30days">30 ngày qua</option>
                    <option value="thisMonth">Tháng này</option>
                </Form.Select>
            </div>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-primary text-white h-100">
                        <Card.Body>
                            <h6 className="text-uppercase mb-2 opacity-75">Tổng Doanh Thu</h6>
                            <h3 className="fw-bold mb-0">{formatCurrency(summary.total_revenue)}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-success text-white h-100">
                        <Card.Body>
                            <h6 className="text-uppercase mb-2 opacity-75">Đơn Hàng Hoàn Tất</h6>
                            <h3 className="fw-bold mb-0">{summary.total_orders} đơn</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-info text-white h-100">
                        <Card.Body>
                            <h6 className="text-uppercase mb-2 opacity-75">Sản Phẩm Đã Bán</h6>
                            <h3 className="fw-bold mb-0">{summary.total_items_sold} sản phẩm</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={8} className="mb-4 mb-lg-0">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Biến động doanh thu</h5>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timeline}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Line type="monotone" dataKey="revenue" stroke="#00a651" strokeWidth={3} name="Doanh thu" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Cơ cấu theo danh mục</h5>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="revenue"
                                            nameKey="category_name"
                                        >
                                            {categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold mb-3">Top Sản Phẩm Bán Chạy</h5>
                    <Table responsive hover>
                        <thead className="bg-light">
                            <tr>
                                <th>STT</th>
                                <th>Tên sản phẩm</th>
                                <th className="text-center">Số lượng bán</th>
                                <th className="text-end">Doanh thu mang lại</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.length > 0 ? topProducts.map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td className="fw-medium">{product.name}</td>
                                    <td className="text-center">{product.total_sold}</td>
                                    <td className="text-end fw-bold text-success">{formatCurrency(product.revenue)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center">Chưa có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RevenueReportPage;