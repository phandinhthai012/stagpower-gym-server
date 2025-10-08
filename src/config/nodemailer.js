import nodemailer from 'nodemailer';


const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'thaiphan09242002@gmail.com',
        pass: process.env.EMAIL_PASS || 'xdrumuwidxgmfrih'
    }
}

const transporter = nodemailer.createTransport(emailConfig);
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email connection verified successfully');
    } catch (error) {
        console.error('Email connection verification failed:', error);
    }
}

// Email templates
const emailTemplates = {
    welcome: {
        subject: 'Chào mừng đến với StagPower Gym!',
        html: `
            <h2>Chào mừng bạn đến với StagPower Gym!</h2>
            <p>Xin chào <strong>{{fullName}}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại StagPower Gym.</p>
            <p>Chúc bạn có những buổi tập luyện hiệu quả!</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ StagPower Gym</p>
        `
    },

    passwordReset: {
        subject: 'Đặt lại mật khẩu - StagPower Gym',
        html: `
            <h2>Đặt lại mật khẩu</h2>
            <p>Xin chào <strong>{{fullName}}</strong>,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
            <a href="{{resetLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
            <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ StagPower Gym</p>
        `
    },

    emailVerification: {
        subject: 'Xác thực email - StagPower Gym',
        html: `
            <h2>Xác thực email</h2>
            <p>Xin chào <strong>{{fullName}}</strong>,</p>
            <p>Vui lòng xác thực email của bạn bằng cách nhấp vào liên kết bên dưới:</p>
            <a href="{{verificationLink}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xác thực email</a>
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ StagPower Gym</p>
        `
    }
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"StagPower Gym" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
};

// Send template email
const sendTemplateEmail = async ({ to, template, data }) => {
    try {
        const templateConfig = emailTemplates[template];
        if (!templateConfig) {
            throw new Error(`Email template '${template}' not found`);
        }

        // Replace placeholders in template
        let html = templateConfig.html;
        let subject = templateConfig.subject;

        Object.keys(data).forEach(key => {
            const placeholder = `{{${key}}}`;
            html = html.replace(new RegExp(placeholder, 'g'), data[key]);
            subject = subject.replace(new RegExp(placeholder, 'g'), data[key]);
        });

        return await sendEmail({ to, subject, html });
    } catch (error) {
        console.error('❌ Template email sending failed:', error.message);
        throw error;
    }
};

export { 
    transporter,
    sendTemplateEmail,
    sendEmail,
    verifyConnection
}