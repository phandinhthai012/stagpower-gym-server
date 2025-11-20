import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';


const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not set, email functionality may not work');
        return;
    }
    try {
        // Resend không cần verify connection như nodemailer
        console.log("✅ Resend email service configured");
    } catch (error) {
        console.warn("⚠️ Resend configuration failed:", error.message);
    }
};

export { 
    resend,
    verifyConnection,
    emailTemplates
}
