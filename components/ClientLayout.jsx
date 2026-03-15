import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';

const ClientLayout = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Header màu xanh mới */}
            <ClientHeader />
            
            {/* Phần nội dung thay đổi giữa các trang */}
            <main className="flex-grow-1">
                <Outlet />
            </main>
            
            {/* Footer mới */}
            <ClientFooter />
        </div>
    );
};

export default ClientLayout;