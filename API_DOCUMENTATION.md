# StagPower Gym Server - API Documentation

## 📋 Tổng quan
Hệ thống quản lý phòng gym với đầy đủ tính năng từ quản lý thành viên, gói tập, thanh toán đến AI suggestions.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication & Authorization

### 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | ❌ | - |
| `POST` | `/api/auth/login` | Đăng nhập | ❌ | - |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ | All |
| `POST` | `/api/auth/logout` | Đăng xuất | ✅ | All |
| `POST` | `/api/auth/logout-all-devices` | Đăng xuất tất cả thiết bị | ✅ | All |
| `POST` | `/api/auth/refresh` | Refresh token | ✅ | All |
| `PUT` | `/api/auth/change-password` | Đổi mật khẩu | ✅ | All |
| `POST` | `/api/auth/forgot-password` | Quên mật khẩu | ❌ | - |
| `POST` | `/api/auth/verify-otp` | Xác thực OTP | ❌ | - |
| `POST` | `/api/auth/resend-otp` | Gửi lại OTP | ❌ | - |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu | ❌ | - |

---

## 👥 User Management

### 2. User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/user/` | Lấy tất cả users | ✅ | All |
| `GET` | `/api/user/paginated` | Users với phân trang | ✅ | All |
| `GET` | `/api/user/members` | Lấy tất cả members | ✅ | All |
| `GET` | `/api/user/members/paginated` | Members với phân trang | ✅ | All |
| `GET` | `/api/user/staffs` | Lấy tất cả staff | ✅ | All |
| `GET` | `/api/user/staffs/paginated` | Staff với phân trang | ✅ | All |
| `POST` | `/api/user/create` | Tạo user mới | ✅ | admin, staff |
| `GET` | `/api/user/:userId` | Lấy user theo ID | ❌ | - |
| `PUT` | `/api/user/:userId` | Cập nhật user | ✅ | All |
| `PUT` | `/api/user/:userId/profile` | Cập nhật profile | ✅ | All |
| `PUT` | `/api/user/:userId/status` | Thay đổi trạng thái user | ❌ | - |

---

## 📦 Package Management

### 3. Package Routes (`/api/packages`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/packages/` | Lấy tất cả packages | ❌ | - |
| `GET` | `/api/packages/paginated` | Packages với phân trang | ❌ | - |
| `POST` | `/api/packages/` | Tạo package mới | ❌ | - |
| `GET` | `/api/packages/:id` | Lấy package theo ID | ❌ | - |
| `PUT` | `/api/packages/:id` | Cập nhật package | ✅ | admin, trainer, staff |
| `PUT` | `/api/packages/:id/status` | Thay đổi trạng thái package | ✅ | admin, staff |
| `DELETE` | `/api/packages/:id` | Xóa package | ✅ | admin, staff |

---

## 🎫 Subscription Management

### 4. Subscription Routes (`/api/subscriptions`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/subscriptions/` | Tạo subscription | ✅ | admin, staff, member |
| `GET` | `/api/subscriptions/` | Lấy tất cả subscriptions | ✅ | admin, staff |
| `GET` | `/api/subscriptions/member/:memberId` | Subscriptions của member | ✅ | All |
| `GET` | `/api/subscriptions/:id` | Lấy subscription theo ID | ✅ | All |
| `PUT` | `/api/subscriptions/:id` | Cập nhật subscription | ✅ | admin, staff, member |
| `DELETE` | `/api/subscriptions/:id` | Xóa subscription | ✅ | admin, staff |
| `POST` | `/api/subscriptions/:id/suspend` | Tạm ngưng subscription | ✅ | admin, staff |
| `POST` | `/api/subscriptions/:id/unsuspend` | Kích hoạt lại subscription | ✅ | admin, staff |

---

## 💳 Payment Management

### 5. Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/payments/` | Tạo payment | ✅ | All |
| `GET` | `/api/payments/` | Lấy tất cả payments | ✅ | admin, staff |
| `GET` | `/api/payments/:id` | Lấy payment theo ID | ✅ | All |
| `PUT` | `/api/payments/:id` | Cập nhật payment | ✅ | admin, staff |
| `DELETE` | `/api/payments/:id` | Xóa payment | ✅ | admin |
| `GET` | `/api/payments/member/:memberId` | Payments của member | ✅ | All |
| `POST` | `/api/payments/momo/create` | Tạo payment MoMo | ❌ | - |
| `POST` | `/api/payments/momo/ipn` | MoMo callback | ❌ | - |
| `POST` | `/api/payments/:id/complete` | Hoàn thành payment | ✅ | admin, staff |

---

## 🏢 Branch Management

### 6. Branch Routes (`/api/branches`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/branches/` | Tạo branch mới | ✅ | admin |
| `GET` | `/api/branches/` | Lấy tất cả branches | ✅ | admin, staff |
| `GET` | `/api/branches/:id` | Lấy branch theo ID | ✅ | admin, staff |
| `PUT` | `/api/branches/:id` | Cập nhật branch | ✅ | admin, staff |
| `DELETE` | `/api/branches/:id` | Xóa branch | ✅ | admin |
| `PUT` | `/api/branches/:id/status` | Thay đổi trạng thái branch | ✅ | admin |

---

## 📅 Schedule Management

### 7. Schedule Routes (`/api/schedules`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/schedules/paginated` | Schedules với phân trang | ❌ | - |
| `GET` | `/api/schedules/member/:memberId/paginated` | Schedules của member (phân trang) | ❌ | - |
| `GET` | `/api/schedules/trainer/:trainerId/paginated` | Schedules của trainer (phân trang) | ❌ | - |
| `GET` | `/api/schedules/member/:memberId` | Schedules của member | ✅ | All |
| `GET` | `/api/schedules/trainer/:trainerId` | Schedules của trainer | ✅ | All |
| `POST` | `/api/schedules/` | Tạo schedule | ✅ | All |
| `GET` | `/api/schedules/` | Lấy tất cả schedules | ✅ | admin, staff |
| `GET` | `/api/schedules/:id` | Lấy schedule theo ID | ✅ | All |
| `PUT` | `/api/schedules/:id` | Cập nhật schedule | ✅ | All |
| `DELETE` | `/api/schedules/:id` | Xóa schedule | ✅ | admin, staff |

---

## 🏃‍♂️ Check-in System

### 8. Check-in Routes (`/api/check-ins`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/check-ins/` | Check-in | ✅ | All |
| `GET` | `/api/check-ins/` | Lấy tất cả check-ins | ✅ | All |
| `GET` | `/api/check-ins/:id` | Lấy check-in theo ID | ✅ | All |
| `PUT` | `/api/check-ins/:id` | Cập nhật check-in | ✅ | admin, staff |
| `GET` | `/api/check-ins/member/:memberId` | Check-ins của member | ✅ | All |
| `GET` | `/api/check-ins/checkInTime/:checkInTime` | Check-ins theo thời gian | ✅ | All |
| `PUT` | `/api/check-ins/:id/checkOut` | Check-out | ✅ | All |
| `GET` | `/api/check-ins/paginated` | Check-ins với phân trang | ✅ | All |
| `GET` | `/api/check-ins/qrCode/:memberId` | Tạo QR code | ✅ | All |
| `POST` | `/api/check-ins/qrCode/checkIn` | Check-in bằng QR code | ✅ | All |

---

## 💪 Exercise Management

### 9. Exercise Routes (`/api/exercises`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/exercises/search` | Tìm kiếm exercises | ❌ | - |
| `GET` | `/api/exercises/level` | Exercises theo level | ❌ | - |
| `POST` | `/api/exercises/` | Tạo exercise | ✅ | admin, staff, trainer |
| `GET` | `/api/exercises/` | Lấy tất cả exercises | ❌ | - |
| `GET` | `/api/exercises/:id` | Lấy exercise theo ID | ❌ | - |
| `PUT` | `/api/exercises/:id` | Cập nhật exercise | ✅ | admin, staff, trainer |
| `DELETE` | `/api/exercises/:id` | Xóa exercise | ✅ | admin, staff |

---

## 🤖 AI Suggestion System

### 10. AI Suggestion Routes (`/api/ai-suggestions`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/ai-suggestions/test` | Test AI suggestion | ❌ | - |
| `POST` | `/api/ai-suggestions/` | Tạo AI suggestion | ✅ | All |
| `GET` | `/api/ai-suggestions/member/:memberId` | Suggestions của member | ✅ | All |
| `GET` | `/api/ai-suggestions/:id` | Lấy suggestion theo ID | ✅ | All |
| `DELETE` | `/api/ai-suggestions/:id` | Xóa suggestion | ✅ | All |
| `POST` | `/api/ai-suggestions/suggestion/generate` | Tạo workout suggestion | ❌ | - |
| `POST` | `/api/ai-suggestions/suggestion/nutrition` | Tạo nutrition suggestion | ❌ | - |

---

## 🎫 Discount Management

### 11. Discount Routes (`/api/discounts`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/discounts/` | Lấy tất cả discounts | ✅ | All |
| `POST` | `/api/discounts/` | Tạo discount | ✅ | admin, staff |
| `GET` | `/api/discounts/:id` | Lấy discount theo ID | ❌ | - |
| `PUT` | `/api/discounts/:id` | Cập nhật discount | ✅ | admin, staff |
| `PUT` | `/api/discounts/:id/status` | Thay đổi trạng thái discount | ✅ | admin, staff |
| `DELETE` | `/api/discounts/:id` | Xóa discount | ✅ | admin |

---

## 📅 Booking Request System

### 12. Booking Request Routes (`/api/booking-requests`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/booking-requests/paginated` | Booking requests với phân trang | ❌ | - |
| `POST` | `/api/booking-requests/` | Tạo booking request | ✅ | All |
| `GET` | `/api/booking-requests/` | Lấy tất cả booking requests | ✅ | admin, staff, trainer |
| `GET` | `/api/booking-requests/:id` | Lấy booking request theo ID | ✅ | All |
| `PUT` | `/api/booking-requests/:id` | Cập nhật booking request | ✅ | All |
| `DELETE` | `/api/booking-requests/:id` | Xóa booking request | ✅ | All |
| `PUT` | `/api/booking-requests/:id/confirm` | Xác nhận booking request | ✅ | All |
| `PUT` | `/api/booking-requests/:id/reject` | Từ chối booking request | ✅ | All |
| `GET` | `/api/booking-requests/status/:status` | Booking requests theo status | ✅ | All |
| `GET` | `/api/booking-requests/member/:memberId` | Booking requests của member | ✅ | All |
| `GET` | `/api/booking-requests/trainer/:trainerId` | Booking requests của trainer | ✅ | All |

---

## 🏥 Health Info Management

### 13. Health Info Routes (`/api/health-info`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/health-info/` | Lấy tất cả health info | ✅ | admin, trainer, staff |
| `GET` | `/api/health-info/me` | Lấy health info của tôi | ✅ | All |
| `GET` | `/api/health-info/member/:memberId` | Health info của member | ❌ | - |
| `GET` | `/api/health-info/:id` | Lấy health info theo ID | ✅ | All |
| `POST` | `/api/health-info/:memberId` | Tạo health info | ❌ | - |
| `PUT` | `/api/health-info/:id` | Cập nhật health info | ✅ | All |
| `DELETE` | `/api/health-info/:id` | Xóa health info | ✅ | admin, trainer |

---

## 🔔 Notification System

### 14. Notification Routes (`/api/notifications`) - **Currently Commented**

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/notifications/` | Tạo notification | ❌ | - |
| `GET` | `/api/notifications/` | Lấy tất cả notifications | ❌ | - |
| `GET` | `/api/notifications/paginated` | Notifications với phân trang | ❌ | - |
| `GET` | `/api/notifications/user/:userId` | Notifications của user | ❌ | - |
| `GET` | `/api/notifications/user/:userId/paginated` | Notifications của user (phân trang) | ❌ | - |
| `GET` | `/api/notifications/:id` | Lấy notification theo ID | ❌ | - |
| `PATCH` | `/api/notifications/:id/read` | Đánh dấu đã đọc | ❌ | - |
| `PATCH` | `/api/notifications/:id/unread` | Đánh dấu chưa đọc | ❌ | - |
| `DELETE` | `/api/notifications/:id` | Xóa notification | ❌ | - |

---

## 🏥 Health Check

### 15. System Routes

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/ping` | Health check | ❌ | - |

---

## 📊 Tổng kết

### **Tổng số API endpoints: 85+**

### **Phân loại theo chức năng:**
- **Authentication:** 10 endpoints
- **User Management:** 10 endpoints  
- **Package Management:** 7 endpoints
- **Subscription Management:** 8 endpoints
- **Payment Management:** 9 endpoints
- **Branch Management:** 6 endpoints
- **Schedule Management:** 9 endpoints
- **Check-in System:** 9 endpoints
- **Exercise Management:** 7 endpoints
- **AI Suggestion:** 6 endpoints
- **Discount Management:** 6 endpoints
- **Booking Request:** 10 endpoints
- **Health Info:** 7 endpoints
- **Notification:** 9 endpoints (commented)
- **System:** 1 endpoint

### **Phân loại theo HTTP Methods:**
- **GET:** 45+ endpoints
- **POST:** 20+ endpoints
- **PUT:** 15+ endpoints
- **DELETE:** 8+ endpoints
- **PATCH:** 3+ endpoints

### **Phân loại theo Authentication:**
- **Public (No Auth):** 25+ endpoints
- **Authenticated:** 60+ endpoints

### **Phân loại theo Roles:**
- **All Roles:** 40+ endpoints
- **Admin Only:** 15+ endpoints
- **Admin + Staff:** 20+ endpoints
- **Admin + Staff + Trainer:** 10+ endpoints

---

## 🚀 Ghi chú

1. **Notification routes** hiện đang bị comment trong `index.js` - cần uncomment để sử dụng
2. **Pagination** được hỗ trợ cho hầu hết các endpoints
3. **Rate limiting** được áp dụng cho authentication endpoints
4. **Validation** được áp dụng cho tất cả input data
5. **CORS** được cấu hình cho multiple origins
6. **Security** được bảo vệ bằng Helmet middleware

---

## 📝 Cập nhật cuối cùng
*Tài liệu được tạo tự động từ source code - Cập nhật: $(date)*
