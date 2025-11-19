import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const emailConfig = {
    service: 'gmail',  // Dùng service thay vì host
    auth: {
        user: process.env.EMAIL_USER || 'thaiphan09242002@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdrumuwidxgmfrih'
    },
    connectionTimeout: 60000,  // Tăng lên 60s
    greetingTimeout: 60000,
    socketTimeout: 60000,
    tls: {
        rejectUnauthorized: false
    }
}

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

    try {
        // Set timeout cho verification
        const verifyPromise = await transporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Verification timeout after 15 seconds')), 15000)
        );
        
        await Promise.race([verifyPromise, timeoutPromise]);
        console.log('✅ Email connection verified successfully');
    } catch (error) {
        // Không throw error, chỉ log warning để không block server start
        console.warn('⚠️  Email connection verification failed:', error.message || error);
        console.warn('⚠️  Server will continue to start, but email sending may fail');
        console.warn('⚠️  To skip verification, set SKIP_EMAIL_VERIFICATION=true in environment variables');
    }
}

export { 
    transporter,
    verifyConnection,
    emailTemplates
}