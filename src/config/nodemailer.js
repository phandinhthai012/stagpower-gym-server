import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';


const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'thaiphan09242002@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdrumuwidxgmfrih'
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
    try {
        await transporter.verify();
        console.log('Email connection verified successfully');
    } catch (error) {
        console.error('Email connection verification failed:', error);
    }
}

export { 
    transporter,
    verifyConnection,
    emailTemplates
}