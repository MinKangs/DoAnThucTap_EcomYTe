#Hệ thống Quản trị Nhà thuốc EcomYTe

Hệ thống quản lý và bán lẻ dược phẩm, thiết bị y tế toàn diện cho nhà thuốc sử dụng PERN Stack (PostgreSQL, Express.js, React.js, Node.js).

## Tính năng

* **Quản lý thông tin tài khoản:** Đăng nhập, đăng ký, phân quyền người dùng (Khách hàng, Nhân viên, Quản trị viên).
* **Quản lý quy trình mua hàng:** Giỏ hàng, đặt hàng (Checkout) và xem lịch sử đơn hàng.
* **Quản lý sản phẩm và danh mục:** Thêm, sửa, ẩn sản phẩm, quản lý nhà phân phối.
* **Quản lý kho vận (Inventory):** Kiểm soát lô hàng nhập/xuất, vị trí lưu trữ (Kho/Khu vực/Kệ), cảnh báo hàng sắp hết hoặc hết hạn sử dụng.
* **Hỗ trợ khách hàng trực tuyến:** Live Chat thời gian thực tích hợp Socket.io giữa nhân viên và khách hàng.
* **Báo cáo và thống kê:** Thống kê doanh thu, biểu đồ trực quan và Top sản phẩm bán chạy.

## Yêu cầu hệ thống

* **Node.js** (v16.x trở lên)
* **PostgreSQL** (v12.x trở lên)
* **Git**

## Cài đặt

**1. Clone repository:**

```bash
git clone https://github.com/MinKangs/DoAnThucTap_EcomYTe.git
cd DoAnThucTap_EcomYTe
```

**2. Thiết lập Cơ sở dữ liệu (PostgreSQL):**

* Mở công cụ quản trị PostgreSQL (như pgAdmin).
* Tạo một cơ sở dữ liệu mới với tên là `ecom_yte`.
* Chạy file script SQL (nếu có) để khởi tạo các bảng và dữ liệu mẫu.

**3. Cài đặt và khởi chạy Backend:**

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện cần thiết
npm install
```

Tạo một file `.env` ở thư mục gốc của `backend` và cấu hình các biến môi trường:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mat_khau_database_cua_ban
DB_NAME=ecom_yte
JWT_SECRET=chuoi_khoa_bao_mat_jwt
```

Khởi chạy máy chủ Backend:

```bash
npm start
# Server sẽ chạy tại cổng 5000
```

**4. Cài đặt và khởi chạy Frontend:**

Mở một Terminal/Command Prompt mới và thực hiện:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện cần thiết
npm install

# Khởi chạy giao diện người dùng
npm run dev
```

## Truy cập ứng dụng

* **Giao diện Khách hàng & Quản trị (Frontend):** Truy cập `http://localhost:5173` trên trình duyệt.
* **Máy chủ API (Backend):** Chạy ngầm tại `http://localhost:5000`.
* **Tài khoản Admin Demo:** `admin@gmail.com` / `123456` *(Tuỳ thuộc vào dữ liệu bạn thiết lập trong Database)*.

## Cấu trúc Project

```text
DoAnThucTap_EcomYTe/
├── backend/                # Server API (Node.js & Express)
│   ├── config/             # Cấu hình kết nối Database
│   ├── controllers/        # Logic xử lý các API endpoint
│   ├── middlewares/        # Xác thực JWT, xử lý Upload ảnh
│   ├── models/             # Tương tác với CSDL PostgreSQL
│   ├── routes/             # Định tuyến đường dẫn API
│   └── server.js           # File khởi chạy server chính
│
└── frontend/               # Giao diện người dùng (React & Vite)
    ├── public/             # Tài nguyên tĩnh (favicon...)
    └── src/
        ├── assets/         # Hình ảnh, icons
        ├── components/     # Các UI Component dùng chung (Header, Footer, Layout)
        ├── context/        # Quản lý State toàn cục (AuthContext, CartContext)
        ├── pages/          # Các trang giao diện (Home, Cart, Checkout...)
        │   └── admin/      # Các trang thuộc phân hệ Quản trị viên
        └── services/       # Cấu hình Axios để gọi API backend
```
