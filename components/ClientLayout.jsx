import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';
import ChatWidget from './ChatWidget'; // <-- Import thêm khung chat

const ClientLayout = () => {
    return (
        <div className="d-flex flex-column min-vh-100 position-relative">
            {/* Header */}
            <ClientHeader />
            
            {/* Phần nội dung thay đổi giữa các trang */}
            <main className="flex-grow-1">
                <Outlet />
            </main>
            
            {/* Footer */}
            <ClientFooter />

            {/* Đặt khung chat ở đây để chỉ hiển thị cho Khách hàng */}
            <ChatWidget />
        </div>
    );
};

export default ClientLayout;