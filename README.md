# StagPower Gym Server

Backend API for Smart Gym Management System - A comprehensive gym management platform with AI-powered features, real-time notifications, and automated scheduling.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Create .env file (see Environment Variables section)
# Add your environment variables

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOSTNAME=localhost
SERVER_URL=http://localhost:5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=stagpower_gym

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# AI Configuration (Google Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Payment Gateway (MoMo)
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENVIRONMENT=sandbox
```

## 🛠️ Scripts

- `npm run dev` - Start development server with nodemon and Babel
- `npm run build` - Build production files (Babel transpilation)
- `npm start` - Start production server (runs build first)
- `npm run start:prod` - Start production server directly
- `npm test` - Run tests (Jest)

## 📊 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints

- **Authentication** (`/api/auth`)
  - Register, Login, Logout
  - Password reset with OTP
  - Refresh token
  - Change password

- **Users** (`/api/user`)
  - User management (CRUD)
  - Member/Staff management
  - Profile updates
  - Status management

- **Packages** (`/api/packages`)
  - Package management
  - Package status updates

- **Subscriptions** (`/api/subscriptions`)
  - Subscription creation and management
  - Suspend/Unsuspend subscriptions
  - Renew subscriptions
  - Auto-expiration handling

- **Payments** (`/api/payments`)
  - Payment processing
  - MoMo payment gateway integration
  - Payment history

- **Schedules** (`/api/schedules`)
  - PT session scheduling
  - Schedule management
  - Auto-cancellation for pending schedules

- **Booking Requests** (`/api/booking-requests`)
  - Booking request management
  - Auto-expiration handling

- **Check-ins** (`/api/check-ins`)
  - Member check-in/check-out
  - Auto-checkout for stale check-ins
  - QR code generation

- **Exercises** (`/api/exercises`)
  - Exercise library management
  - Exercise assignment to schedules

- **AI Suggestions** (`/api/ai-suggestions`)
  - AI-powered workout suggestions
  - Health analysis based on health info

- **Health Info** (`/api/health-info`)
  - Health information management
  - File upload and parsing (PDF, Excel)

- **Notifications** (`/api/notifications`)
  - Notification management
  - Real-time notifications via Socket.IO

- **Branches** (`/api/branches`)
  - Gym branch management

- **Discounts** (`/api/discounts`)
  - Discount code management

### Health Check
- `GET /api/ping` - Check API status
- `GET /` - Welcome message

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔄 Automated Jobs (Cron)

The system includes automated background jobs:

- **Schedule Jobs** (`schedule.jobs.js`)
  - Auto-cancel pending schedules after 2 hours (runs every 1 hour)
  - Auto-complete confirmed schedules after 24 hours (runs daily at 02:00 AM)

- **Booking Jobs** (`booking.jobs.js`)
  - Auto-expire pending booking requests after 2 hours (runs every 2 hours)

- **Subscription Jobs** (`subscription.jobs.js`)
  - Auto-expire subscriptions at midnight (runs daily at 00:00)
  - Auto-activate NotStarted subscriptions (runs daily at 00:00)
  - Auto-unsuspend subscriptions (runs daily at 00:00)
  - Subscription expiry warnings (runs daily at 08:00)

- **Check-in Jobs** (`checkIn.jobs.js`)
  - Auto-checkout stale check-ins after 12 hours (runs every 1 hour)

- **Server Jobs** (`server.jobs.js`)
  - Keep server alive (pings `/api/ping` every 10 minutes)

## 🔌 Real-time Features (Socket.IO)

- Real-time notifications
- Live check-in/check-out updates
- Payment status updates
- Schedule updates
- User status updates

## 🐳 Docker

### Prerequisites
- Docker Desktop

### Using docker-compose (recommended)
```bash
# From this directory
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f server

# Stop
docker compose down
```

### Environment with docker-compose
- Non-sensitive variables are set in `docker-compose.yml` (HOSTNAME, PORT, MONGODB_URI, MONGODB_DATABASE)
- Sensitive variables should be stored in `.env` (do not commit)

Create `Server/stagpower-gym-server/.env` (example):
```env
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
RESEND_API_KEY=your_resend_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
```

In `docker-compose.yml`, you can include:
```yaml
env_file:
  - ./Server/stagpower-gym-server/.env
```

### Hot reload in Docker (development)
- `docker-compose.yml` mounts the source code and enables file watching
- When you save changes, the server restarts automatically via nodemon

## 📁 Project Structure
```
src/
├── app.js              # Main application entry point
├── config/             # Configuration files
│   ├── ai.js          # AI (Google Gemini) configuration
│   ├── cors.js        # CORS configuration
│   ├── database.js    # MongoDB connection
│   ├── momo.js        # MoMo payment gateway config
│   ├── nodemailer.js  # Email service config
│   ├── resend.js      # Resend email service config
│   ├── socket.js      # Socket.IO configuration
│   └── prompts/       # AI prompt templates
├── controllers/        # Request/Response handling
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── subscription.controller.js
│   ├── payment.controller.js
│   ├── schedule.controller.js
│   ├── bookingRequest.controller.js
│   ├── checkIn.controller.js
│   ├── exercise.controller.js
│   ├── aiSuggestion.controller.js
│   └── ...
├── models/            # MongoDB schemas
│   ├── User.js
│   ├── Subscription.js
│   ├── Schedule.js
│   ├── Payment.js
│   ├── BookingRequest.js
│   ├── CheckIn.js
│   └── ...
├── routes/            # API route definitions
│   ├── index.js      # Main router
│   ├── auth.route.js
│   ├── user.routes.js
│   ├── subscription.route.js
│   └── ...
├── services/          # Business logic & external APIs
│   ├── auth.service.js
│   ├── subscription.service.js
│   ├── payment.service.js
│   ├── schedule.service.js
│   ├── socket.service.js
│   └── ...
├── middleware/        # Custom middleware
│   ├── auth.js       # JWT authentication
│   ├── errorHandler.js
│   ├── rateLimit.js
│   ├── validations.js
│   └── upload.js
├── jobs/              # Automated cron jobs
│   ├── index.js
│   ├── schedule.jobs.js
│   ├── booking.jobs.js
│   ├── subscription.jobs.js
│   ├── checkIn.jobs.js
│   └── server.jobs.js
├── socket/            # Socket.IO handlers
│   ├── index.js
│   ├── handler/
│   │   ├── checkIn.handler.js
│   │   ├── notification.handler.js
│   │   ├── payment.handler.js
│   │   └── schedule.handler.js
│   └── middleware/
├── utils/             # Helper functions
│   ├── jwt.js
│   ├── otp.js
│   ├── emailHelper.js
│   ├── pagination.js
│   ├── response.js
│   └── ...
└── templates/          # Email templates
    ├── welcome.html
    ├── otp.html
    └── subscription-expiry-warning.html
```

## 🛡️ Security Features

- ✅ **Helmet.js** - Security headers protection
- ✅ **CORS** - Cross-origin resource sharing configuration
- ✅ **Rate Limiting** - API rate limiting to prevent abuse
- ✅ **Input Validation** - Express-validator for request validation
- ✅ **JWT Authentication** - Access & Refresh token system
- ✅ **Password Hashing** - bcryptjs for secure password storage
- ✅ **OTP System** - One-time password for password reset
- ✅ **Socket.IO Authentication** - Authenticated WebSocket connections
- ✅ **File Upload Validation** - Secure file upload handling

## 🤖 AI Features

- **Google Gemini Integration** - AI-powered workout suggestions
- **Health Analysis** - Analyze health information files (PDF, Excel)
- **Personalized Recommendations** - AI-generated exercise suggestions based on member data

## 💳 Payment Integration

- **MoMo Payment Gateway** - Integrated payment processing
- **Payment Status Tracking** - Real-time payment status updates
- **Transaction History** - Complete payment records

## 📧 Email Services

- **Nodemailer** - Primary email service
- **Resend** - Alternative email service
- **Email Templates** - HTML email templates for:
  - Welcome emails
  - OTP verification
  - Subscription expiry warnings

## 📝 Key Features

### ✅ Implemented
- [x] MongoDB connection with Mongoose
- [x] User authentication & authorization (JWT)
- [x] User management (Members, Staff, Trainers, Admin)
- [x] Package management
- [x] Subscription management with auto-expiration
- [x] Payment processing (MoMo integration)
- [x] Schedule management (PT sessions)
- [x] Booking request system
- [x] Check-in/Check-out system with QR codes
- [x] Exercise library
- [x] AI-powered workout suggestions
- [x] Health information management
- [x] Real-time notifications (Socket.IO)
- [x] Automated cron jobs
- [x] Email service (Nodemailer & Resend)
- [x] File upload & parsing (PDF, Excel)
- [x] Discount code system
- [x] Branch management
- [x] Rate limiting
- [x] Input validation
- [x] Error handling middleware

### 🔄 In Progress / Future Enhancements
- [ ] Advanced reporting system
- [ ] Analytics dashboard
- [ ] Mobile app API optimization
- [ ] Webhook support for payment gateways
- [ ] Advanced AI features
- [ ] Multi-language support
- [ ] Advanced search and filtering

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- Code is well-commented with JSDoc-style comments

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

StagPower Gym Management System Team

---

**Note**: Make sure to configure all environment variables before running the application. Some features require external API keys (Google AI, MoMo, Resend, etc.).
