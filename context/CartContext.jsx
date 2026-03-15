import React, { createContext, useState, useEffect, useContext } from 'react';

// Khởi tạo Context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Lấy dữ liệu giỏ hàng từ localStorage nếu có, nếu không thì dùng mảng rỗng
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Cập nhật localStorage mỗi khi cartItems thay đổi
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Thêm sản phẩm vào giỏ
    const addToCart = (product, quantity) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
            
            if (existingItemIndex >= 0) {
                // Nếu sản phẩm đã có, tăng số lượng
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                // Nếu chưa có, thêm mới vào mảng
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    // Cập nhật số lượng
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems => 
            prevItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
        );
    };

    // Xóa sản phẩm khỏi giỏ
    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Xóa toàn bộ giỏ hàng (dùng sau khi thanh toán thành công)
    const clearCart = () => {
        setCartItems([]);
    };

    // Tính tổng tiền
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Tính tổng số lượng sản phẩm (để hiển thị trên Header)
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            updateQuantity, 
            removeFromCart, 
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook để sử dụng Context nhanh hơn
export const useCart = () => useContext(CartContext);