import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const emailConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Gmail bắt buộc khi dùng port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // App password, không phải mật khẩu Gmail
    }
};

const transporter = nodemailer.createTransport(emailConfig);

// Email templates configuration
const emailTemplates = {
    otp: {
        subject: 'Mã Xác Thực - StagPower Gym',
        html: fs.readFileSync(path.join(__dirname, '../templates/otp.html'), 'utf8')
    },
    welcome: {
        subject: 'Chào Mừng - StagPower Gym',
        html: fs.readFileSync(path.join(__dirname, '../templates/welcome.html'), 'utf8')
    },
    subscriptionExpiryWarning: {
        subject: 'Thông Báo - StagPower Gym',
        html: fs.readFileSync(path.join(__dirname, '../templates/subscription-expiry-warning.html'), 'utf8')
    }
};

const verifyConnection = async () => {
    // Skip verification trong production nếu có flag
    if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
        console.log('⚠️  Email verification skipped (SKIP_EMAIL_VERIFICATION=true)');
        return;
    }
    console.log(process.env.SKIP_EMAIL_VERIFICATION);
    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_PASS);
    console.log(process.env.NODE_ENV);
    try {
        await transporter.verify();
        console.log("✅ Gmail SMTP connected successfully");
    } catch (error) {
        console.warn("⚠️ Gmail SMTP connection failed:", error.message);
        console.warn("⚠️ Server vẫn chạy nhưng gửi mail có thể fail");
    }
};

export { 
    transporter,
    verifyConnection,
    emailTemplates
}