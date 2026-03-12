import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-wrapper">
            <Container className="text-center">
                <h1 className="display-4 home-title">Hệ Thống Thiết Bị Y Tế</h1>
                <p className="lead mt-3 mb-4 text-muted">
                    Cung cấp các sản phẩm chăm sóc sức khỏe chính hãng, chất lượng cao.
                </p>
                <Button as={Link} to="/products" size="lg" className="btn-home">
                    Xem danh sách sản phẩm
                </Button>
            </Container>
        </div>
    );
};

export default HomePage;