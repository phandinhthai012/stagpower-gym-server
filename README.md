# StagPower Gym Server

Backend API for Smart Gym Management System

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation
```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
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

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=stagpower_gym

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=
```

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Root
- `GET /` - Welcome message

## 🛠️ Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## 📁 Project Structure
```
src/
├── controllers/    # Request/Response handling
├── models/         # MongoDB schemas
├── routes/         # API route definitions
├── middleware/     # Custom middleware
├── services/       # Business logic & external APIs
├── utils/          # Helper functions
├── config/         # Configuration files
└── app.js          # Main app file
```

## 🛡️ Security Features
- Helmet.js for security headers
- CORS enabled
- Rate limiting
- Input validation
- JWT authentication (coming soon)

## 📝 TODO
- [ ] Add MongoDB connection
- [ ] Create User model
- [ ] Add authentication routes
- [ ] Add member management
- [ ] Add class scheduling
- [ ] Add payment processing
- [ ] Add reporting system
- [ ] Add email service
- [ ] Add notification service
- [ ] Add payment gateway integration

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is licensed under the MIT License.
