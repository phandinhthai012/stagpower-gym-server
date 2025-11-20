import nodemailer from 'nodemailer';
// không sử dụng nodemailer thay bằng resend

const emailConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

const transporter = nodemailer.createTransport(emailConfig);


const verifyConnection = async () => {
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
}