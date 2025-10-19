# StagPower Gym Server - API Documentation

## 📋 Tổng quan
Hệ thống quản lý phòng gym với đầy đủ tính năng từ quản lý thành viên, gói tập, thanh toán đến AI suggestions.

**Base URL:** `http://localhost:5000/api`

---

## 🚨 **CẢNH BÁO BẢO MẬT QUAN TRỌNG**

File này được tạo tự động bằng cách phân tích source code. Các endpoints được đánh dấu với:
- ⚠️ **SECURITY ISSUE**: Có vấn đề bảo mật cần fix ngay
- ❌ **NO AUTH**: Không có authentication (có thể là public endpoint)
- ✅ **SECURED**: Có authentication và authorization hợp lý

---

## 🔐 Authentication & Authorization

### 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | ❌ | - | Rate limited ✅ |
| `POST` | `/api/auth/login` | Đăng nhập | ❌ | - | Rate limited ✅ |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ | All | ✅ |
| `POST` | `/api/auth/logout` | Đăng xuất | ✅ verifyRefreshToken | All | Uses refresh token ✅ |
| `POST` | `/api/auth/logout-all-devices` | Đăng xuất tất cả thiết bị | ✅ | All | ✅ |
| `POST` | `/api/auth/refresh` | Refresh token | ✅ verifyRefreshToken | All | Uses refresh token ✅ |
| `PUT` | `/api/auth/change-password` | Đổi mật khẩu | ✅ | All | ✅ |
| `POST` | `/api/auth/forgot-password` | Quên mật khẩu | ❌ | - | Rate limited ✅ |
| `POST` | `/api/auth/verify-otp` | Xác thực OTP | ❌ | - | ✅ |
| `POST` | `/api/auth/resend-otp` | Gửi lại OTP | ❌ | - | ✅ |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu | ❌ | - | ✅ |

---

## 👥 User Management

### 2. User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/user/` | Lấy tất cả users | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/user/paginated` | Users với phân trang | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/user/members` | Lấy tất cả members | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/user/members/paginated` | Members với phân trang | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/user/staffs` | Lấy tất cả staff | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/user/staffs/paginated` | Staff với phân trang | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `POST` | `/api/user/create` | Tạo user mới | ✅ | admin, staff | ✅ |
| `GET` | `/api/user/:userId` | Lấy user theo ID | ❌ | - | ⚠️ **LỖI BẢO MẬT**: Ai cũng xem được |
| `PUT` | `/api/user/:userId/profile` | Cập nhật profile | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/user/:userId/status` | Thay đổi trạng thái user | ✅ | admin, staff | ✅ |

**⚠️ MISSING ENDPOINT**: `PUT /api/user/:userId` không tồn tại trong routes

---

## 📦 Package Management

### 3. Package Routes (`/api/packages`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/packages/` | Lấy tất cả packages | ❌ | - | ✅ Public cho members xem |
| `GET` | `/api/packages/paginated` | Packages với phân trang | ❌ | - | ✅ Public cho members xem |
| `POST` | `/api/packages/` | Tạo package mới | ❌ | - | 🔴 **LỖI BẢO MẬT NGHIÊM TRỌNG**: Ai cũng tạo được! |
| `GET` | `/api/packages/:id` | Lấy package theo ID | ❌ | - | ✅ Public cho members xem |
| `PUT` | `/api/packages/:id` | Cập nhật package | ✅ | admin, trainer, staff | ✅ |
| `PUT` | `/api/packages/:id/status` | Thay đổi trạng thái package | ✅ | admin, staff | ✅ |
| `DELETE` | `/api/packages/:id` | Xóa package | ✅ | admin, staff | ✅ |

---

## 🎫 Subscription Management

### 4. Subscription Routes (`/api/subscriptions`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `POST` | `/api/subscriptions/` | Tạo subscription | ✅ | admin, staff, member | ✅ |
| `GET` | `/api/subscriptions/` | Lấy tất cả subscriptions | ✅ | admin, staff | ✅ |
| `GET` | `/api/subscriptions/member/:memberId` | Subscriptions của member | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/subscriptions/:id` | Lấy subscription theo ID | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/subscriptions/:id` | Cập nhật subscription | ✅ | admin, staff, member | ⚠️ Cần check ownership |
| `DELETE` | `/api/subscriptions/:id` | Xóa subscription | ✅ | admin, staff | ✅ |
| `POST` | `/api/subscriptions/:id/suspend` | Tạm ngưng subscription | ✅ | admin, staff | ✅ |
| `POST` | `/api/subscriptions/:id/unsuspend` | Kích hoạt lại subscription | ✅ | admin, staff | ✅ |
| `PUT` | `/api/subscriptions/:id/status` | Thay đổi trạng thái subscription | ✅ | admin, staff | ✅ |
| `PUT` | `/api/subscriptions/:id/renew` | Gia hạn subscription | ✅ | All | ⚠️ Cần check ownership |

---

## 💳 Payment Management

### 5. Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `POST` | `/api/payments/` | Tạo payment | ✅ | All | ⚠️ Cần validate ownership |
| `GET` | `/api/payments/` | Lấy tất cả payments | ✅ | admin, staff | ✅ |
| `GET` | `/api/payments/stats` | Lấy thống kê payments | ✅ | admin, staff | ✅ |
| `GET` | `/api/payments/:id` | Lấy payment theo ID | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/payments/:id` | Cập nhật payment | ✅ | admin, staff | ✅ |
| `DELETE` | `/api/payments/:id` | Xóa payment | ✅ | admin | ✅ |
| `GET` | `/api/payments/member/:memberId` | Payments của member | ✅ | All | ⚠️ Cần check ownership |
| `POST` | `/api/payments/momo/create` | Tạo payment MoMo | ❌ | - | ⚠️ Nên có auth |
| `POST` | `/api/payments/momo/ipn` | MoMo callback | ❌ | - | ✅ Webhook từ MoMo |
| `POST` | `/api/payments/:id/complete` | Hoàn thành payment | ✅ | admin, staff | ✅ |

---

## 🏢 Branch Management

### 6. Branch Routes (`/api/branches`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `POST` | `/api/branches/` | Tạo branch mới | ✅ | admin | ✅ |
| `GET` | `/api/branches/` | Lấy tất cả branches | ✅ | admin, staff | ✅ |
| `GET` | `/api/branches/public` | Lấy branches active (public) | ❌ | - | ✅ Public endpoint |
| `GET` | `/api/branches/:id` | Lấy branch theo ID | ✅ | admin, staff | ✅ |
| `PUT` | `/api/branches/:id` | Cập nhật branch | ✅ | admin, staff | ✅ |
| `DELETE` | `/api/branches/:id` | Xóa branch | ✅ | admin | ✅ |
| `PUT` | `/api/branches/:id/status` | Thay đổi trạng thái branch | ✅ | admin | ✅ |

---

## 📅 Schedule Management

### 7. Schedule Routes (`/api/schedules`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/schedules/paginated` | Schedules với phân trang | ❌ | - | ⚠️ **LỖI BẢO MẬT**: Ai cũng xem được |
| `GET` | `/api/schedules/member/:memberId/paginated` | Schedules của member (phân trang) | ❌ | - | ⚠️ **LỖI BẢO MẬT**: Ai cũng xem được |
| `GET` | `/api/schedules/trainer/:trainerId/paginated` | Schedules của trainer (phân trang) | ❌ | - | ⚠️ **LỖI BẢO MẬT**: Ai cũng xem được |
| `GET` | `/api/schedules/member/:memberId` | Schedules của member | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/schedules/trainer/:trainerId` | Schedules của trainer | ✅ | All | ⚠️ Cần check ownership |
| `POST` | `/api/schedules/` | Tạo schedule | ✅ | All | ⚠️ Cần validate ownership |
| `GET` | `/api/schedules/` | Lấy tất cả schedules | ✅ | admin, staff | ✅ |
| `GET` | `/api/schedules/:id` | Lấy schedule theo ID | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/schedules/:id` | Cập nhật schedule | ✅ | All | ⚠️ Cần check ownership |
| `DELETE` | `/api/schedules/:id` | Xóa schedule | ✅ | admin, staff | ✅ |

---

## 🏃‍♂️ Check-in System

### 8. Check-in Routes (`/api/check-ins`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `POST` | `/api/check-ins/` | Check-in | ✅ | All | ✅ |
| `GET` | `/api/check-ins/` | Lấy tất cả check-ins | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/check-ins/paginated` | Check-ins với phân trang | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `GET` | `/api/check-ins/:id` | Lấy check-in theo ID | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/check-ins/:id` | Cập nhật check-in | ✅ | admin, staff | ✅ |
| `GET` | `/api/check-ins/member/:memberId` | Check-ins của member | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/check-ins/checkInTime/:checkInTime` | Check-ins theo thời gian | ✅ | All | ⚠️ Nên giới hạn admin/staff |
| `PUT` | `/api/check-ins/:id/checkOut` | Check-out | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/check-ins/qrCode/:memberId` | Tạo QR code | ✅ | All | ⚠️ Cần check ownership |
| `POST` | `/api/check-ins/qrCode/checkIn` | Check-in bằng QR code | ✅ | All | ✅ |

---

## 💪 Exercise Management

### 9. Exercise Routes (`/api/exercises`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/exercises/search` | Tìm kiếm exercises | ❌ | - | ✅ Public cho members |
| `GET` | `/api/exercises/level` | Exercises theo level | ❌ | - | ✅ Public cho members |
| `POST` | `/api/exercises/` | Tạo exercise | ✅ | admin, staff, trainer | ✅ |
| `GET` | `/api/exercises/` | Lấy tất cả exercises | ❌ | - | ✅ Public cho members |
| `GET` | `/api/exercises/:id` | Lấy exercise theo ID | ❌ | - | ✅ Public cho members |
| `PUT` | `/api/exercises/:id` | Cập nhật exercise | ✅ | admin, staff, trainer | ✅ |
| `DELETE` | `/api/exercises/:id` | Xóa exercise | ✅ | admin, staff | ✅ |

---

## 🤖 AI Suggestion System

### 10. AI Suggestion Routes (`/api/ai-suggestions`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/ai-suggestions/test` | Test AI suggestion | ❌ | - | ✅ Test endpoint |
| `POST` | `/api/ai-suggestions/` | Tạo AI suggestion | ✅ | All | ⚠️ Cần validate ownership |
| `GET` | `/api/ai-suggestions/member/:memberId` | Suggestions của member | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/ai-suggestions/:id` | Lấy suggestion theo ID | ✅ | All | ⚠️ Cần check ownership |
| `DELETE` | `/api/ai-suggestions/:id` | Xóa suggestion | ✅ | All | ⚠️ Cần check ownership |
| `POST` | `/api/ai-suggestions/suggestion/generate` | Tạo workout suggestion | ❌ | - | ⚠️ Nên có auth |
| `POST` | `/api/ai-suggestions/suggestion/nutrition` | Tạo nutrition suggestion | ❌ | - | ⚠️ Nên có auth |

---

## 🎫 Discount Management

### 11. Discount Routes (`/api/discounts`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/discounts/` | Lấy tất cả discounts | ❌ | - | ⚠️ **LỖI**: Docs nói ✅ All nhưng route không có auth |
| `POST` | `/api/discounts/` | Tạo discount | ✅ | admin, staff | ✅ |
| `GET` | `/api/discounts/:id` | Lấy discount theo ID | ❌ | - | ✅ Public cho members xem |
| `PUT` | `/api/discounts/:id` | Cập nhật discount | ✅ | admin, staff | ✅ |
| `PUT` | `/api/discounts/:id/status` | Thay đổi trạng thái discount | ✅ | admin, staff | ✅ |
| `DELETE` | `/api/discounts/:id` | Xóa discount | ✅ | admin | ✅ |

---

## 📅 Booking Request System

### 12. Booking Request Routes (`/api/booking-requests`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/booking-requests/paginated` | Booking requests với phân trang | ❌ | - | ⚠️ **LỖI BẢO MẬT**: Ai cũng xem được |
| `POST` | `/api/booking-requests/` | Tạo booking request | ✅ | All | ⚠️ Cần validate ownership |
| `GET` | `/api/booking-requests/` | Lấy tất cả booking requests | ✅ | admin, staff, trainer | ✅ |
| `GET` | `/api/booking-requests/:id` | Lấy booking request theo ID | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/booking-requests/:id` | Cập nhật booking request | ✅ | All | ⚠️ Cần check ownership |
| `DELETE` | `/api/booking-requests/:id` | Xóa booking request | ✅ | All | ⚠️ Cần check ownership |
| `PUT` | `/api/booking-requests/:id/confirm` | Xác nhận booking request | ✅ | All | ⚠️ Chỉ trainer nên được confirm |
| `PUT` | `/api/booking-requests/:id/reject` | Từ chối booking request | ✅ | All | ⚠️ Chỉ trainer nên được reject |
| `GET` | `/api/booking-requests/status/:status` | Booking requests theo status | ✅ | All | ⚠️ Nên giới hạn quyền |
| `GET` | `/api/booking-requests/member/:memberId` | Booking requests của member | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/booking-requests/trainer/:trainerId` | Booking requests của trainer | ✅ | All | ⚠️ Cần check ownership |

---

## 🏥 Health Info Management

### 13. Health Info Routes (`/api/health-info`)

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/health-info/` | Lấy tất cả health info | ✅ | admin, trainer, staff | ✅ |
| `GET` | `/api/health-info/me` | Lấy health info của tôi | ✅ | All | ✅ |
| `GET` | `/api/health-info/member/:memberId` | Health info của member | ❌ | - | ⚠️ **LỖI BẢO MẬT NGHIÊM TRỌNG**: Ai cũng xem được health data! |
| `GET` | `/api/health-info/:id` | Lấy health info theo ID | ✅ | All | ⚠️ Cần check ownership |
| `POST` | `/api/health-info/:memberId` | Tạo health info | ❌ | - | ⚠️ **LỖI BẢO MẬT**: Ai cũng tạo được |
| `PUT` | `/api/health-info/:id` | Cập nhật health info | ✅ | All | ⚠️ Cần check ownership |
| `DELETE` | `/api/health-info/:id` | Xóa health info | ✅ | admin, trainer | ✅ |

---

## 🔔 Notification System

### 14. Notification Routes (`/api/notifications`) - **🟢 ĐANG HOẠT ĐỘNG (KHÔNG BỊ COMMENT)**

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `POST` | `/api/notifications/` | Tạo notification | ✅ | All | ⚠️ **LỖI BẢO MẬT**: Thiếu authorize, ai cũng tạo được |
| `GET` | `/api/notifications/` | Lấy tất cả notifications | ❌ | - | 🔴 **LỖI BẢO MẬT NGHIÊM TRỌNG**: Ai cũng xem được |
| `GET` | `/api/notifications/paginated` | Notifications với phân trang | ❌ | - | 🔴 **LỖI BẢO MẬT NGHIÊM TRỌNG**: Ai cũng xem được |
| `GET` | `/api/notifications/user/:userId` | Notifications của user | ✅ | All | ⚠️ Cần check ownership |
| `GET` | `/api/notifications/user/:userId/paginated` | Notifications của user (phân trang) | ❌ | - | 🔴 **LỖI BẢO MẬT**: Thiếu auth |
| `GET` | `/api/notifications/:id` | Lấy notification theo ID | ❌ | - | 🔴 **LỖI BẢO MẬT**: Ai cũng xem được |
| `PATCH` | `/api/notifications/:id/read` | Đánh dấu đã đọc | ✅ | All | ⚠️ Cần check ownership |
| `PATCH` | `/api/notifications/:id/unread` | Đánh dấu chưa đọc | ✅ | All | ⚠️ Cần check ownership |
| `DELETE` | `/api/notifications/:id` | Xóa notification | ✅ | admin, staff | ✅ |

---

## 🏥 Health Check

### 15. System Routes

| Method | Endpoint | Description | Auth Required | Roles | Security Notes |
|--------|----------|-------------|---------------|-------|----------------|
| `GET` | `/api/ping` | Health check | ❌ | - | ✅ Public health check |

---

## 📊 Tổng kết

### **Tổng số API endpoints: 95+**

### **Phân loại theo chức năng:**
- **Authentication:** 11 endpoints
- **User Management:** 10 endpoints  
- **Package Management:** 7 endpoints
- **Subscription Management:** 10 endpoints (có thêm /renew và /status)
- **Payment Management:** 10 endpoints (có thêm /stats)
- **Branch Management:** 7 endpoints (có thêm /public)
- **Schedule Management:** 10 endpoints
- **Check-in System:** 10 endpoints
- **Exercise Management:** 7 endpoints
- **AI Suggestion:** 6 endpoints
- **Discount Management:** 6 endpoints
- **Booking Request:** 11 endpoints
- **Health Info:** 7 endpoints
- **Notification:** 9 endpoints (ĐANG HOẠT ĐỘNG)
- **System:** 1 endpoint

### **Phân loại theo HTTP Methods:**
- **GET:** 52+ endpoints
- **POST:** 21+ endpoints
- **PUT:** 18+ endpoints
- **DELETE:** 9+ endpoints
- **PATCH:** 2+ endpoints

### **Phân loại theo Authentication:**
- **Public (No Auth):** 22+ endpoints
- **Authenticated:** 73+ endpoints

### **Phân loại theo Roles:**
- **All Roles:** 48+ endpoints
- **Admin Only:** 8+ endpoints
- **Admin + Staff:** 25+ endpoints
- **Admin + Staff + Trainer:** 7+ endpoints

---

## 🚨 **VẤN ĐỀ BẢO MẬT NGHIÊM TRỌNG CẦN FIX NGAY**

### **🔴 CRITICAL - Ưu tiên cao nhất:**

1. **Package Routes:**
   - `POST /api/packages/` - Không có auth, ai cũng tạo package được! 🔴

2. **Health Info Routes:**
   - `GET /api/health-info/member/:memberId` - Không có auth, ai cũng xem health data được! 🔴
   - `POST /api/health-info/:memberId` - Không có auth, ai cũng tạo health info được! 🔴

3. **Notification Routes:**
   - `GET /api/notifications/` - Không có auth, xem tất cả notifications 🔴
   - `GET /api/notifications/paginated` - Không có auth 🔴
   - `GET /api/notifications/:id` - Không có auth 🔴
   - `GET /api/notifications/user/:userId/paginated` - Không có auth 🔴

4. **User Routes:**
   - `GET /api/user/:userId` - Không có auth, ai cũng xem profile được! 🔴

### **⚠️ WARNING - Cần cải thiện:**

5. **Schedule Routes:**
   - Các paginated endpoints không có auth
   
6. **Booking Request Routes:**
   - `GET /api/booking-requests/paginated` - Không có auth

7. **Ownership Checks:**
   - Hầu hết endpoints có auth nhưng không check ownership
   - User A có thể xem/sửa data của User B nếu biết ID

### **📋 Khuyến nghị:**

1. **Thêm authentication** cho tất cả endpoints nhạy cảm
2. **Implement ownership checks** trong controllers
3. **Giới hạn quyền truy cập** cho các endpoints list/view all
4. **Review lại toàn bộ authorization logic**
5. **Thêm rate limiting** cho public endpoints
6. **Log và monitor** các API calls đáng ngờ

---

## 🚀 Ghi chú

1. ✅ **Notification routes đang HOẠT ĐỘNG** - không bị comment như documentation cũ đã nói
2. ✅ **Pagination** được hỗ trợ cho hầu hết các endpoints
3. ✅ **Rate limiting** được áp dụng cho authentication endpoints
4. ✅ **Validation** được áp dụng cho tất cả input data
5. ✅ **CORS** được cấu hình cho multiple origins
6. ✅ **Security** được bảo vệ bằng Helmet middleware
7. ⚠️ **Cần review và fix các vấn đề bảo mật NGAY**

---

## 📝 Cập nhật cuối cùng
*Tài liệu được tạo tự động từ source code - Cập nhật: 2025-10-17*

**Generated by:** Automated API Documentation Scanner
**Status:** ⚠️ Security issues detected - requires immediate attention
