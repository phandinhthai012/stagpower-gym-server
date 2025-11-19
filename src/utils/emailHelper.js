// import { transporter, emailTemplates, } from "../config/nodemailer.js";

// export const sendOtpEmail = async ({ to, data }) => {
//     try {
//         const { subject, html } = emailTemplates.otp;
        
//         // Replace multiple placeholders manually
//         let htmlContent = html;
//         htmlContent = htmlContent.replace(/{{userEmail}}/g, data.userEmail || '');
//         htmlContent = htmlContent.replace(/{{otpCode}}/g, data.otpCode || '');
        
//         const mailOptions = {
//             from: 'StagPower Gym <thaiphan09242002@gmail.com>',
//             to,
//             subject,
//             html: htmlContent 
//         };
        
//         await transporter.sendMail(mailOptions);
//         console.log('✅ OTP email sent successfully to:', to);
//     } catch (error) {
//         console.error('❌ Failed to send OTP email:', error.message);
//         throw error;
//     }
// }

// export const sendWelcomeEmail = async ({ to, data }) => {
//     try {
//         const {userEmail,userName, uid, joinDate, packageName} = data;
//         const { subject, html } = emailTemplates.welcome;
//         let htmlContent = html;
//         const date = new Date(joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//         htmlContent = htmlContent.replace(/{{userEmail}}/g, userEmail || '');
//         htmlContent = htmlContent.replace(/{{userName}}/g, userName || '');
//         htmlContent = htmlContent.replace(/{{userUid}}/g, uid || '');
//         htmlContent = htmlContent.replace(/{{joinDate}}/g, date || '');
//         htmlContent = htmlContent.replace(/{{packageName}}/g, packageName || '');
//         const mailOptions = {
//             from: 'StagPower Gym <thaiphan09242002@gmail.com>',
//             to,
//             subject,
//             html: htmlContent 
//         };
//         await transporter.sendMail(mailOptions);
//         console.log('✅ Welcome email sent successfully to:', to);
//     } catch (error) {
//         console.error('❌ Failed to send Welcome email:', error.message);
//         throw error;
//     }
// }

// export const sendSubscriptionExpiringSoonEmail = async ({ to, data }) => {
//     try {
//         const { subject, html } = emailTemplates.subscriptionExpiryWarning;
//         let htmlContent = html;
//         htmlContent = htmlContent.replace(/{{user.fullName}}/g, data.fullName || '');
//         htmlContent = htmlContent.replace(/{{daysRemaining}}/g, data.daysRemaining || '');
//         htmlContent = htmlContent.replace(/{{user._id}}/g, data._id || '');
//         htmlContent = htmlContent.replace(/{{packageName}}/g, data.packageName || '');
//         const mailOptions = {
//             from: 'StagPower Gym <thaiphan09242002@gmail.com>',
//             to,
//             subject,
//             html: htmlContent 
//         };
//         await transporter.sendMail(mailOptions);
//         console.log('✅ Subscription Expiring Soon email sent successfully to:', to);
//     } catch (error) {
//         console.error('❌ Failed to send Subscription Expiring Soon email:', error.message);
//         throw error;
//     }
// }

import { resend, emailTemplates } from "../config/resend.js";

export const sendOtpEmail = async ({ to, data }) => {
    try {
        const { subject, html } = emailTemplates.otp;
        
        // Replace multiple placeholders manually
        let htmlContent = html;
        htmlContent = htmlContent.replace(/{{userEmail}}/g, data.userEmail || '');
        htmlContent = htmlContent.replace(/{{otpCode}}/g, data.otpCode || '');
        
        const { data: result, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Thay bằng domain đã verify trên Resend
            to: [to],
            subject: subject,
            html: htmlContent
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        console.log('✅ OTP email sent successfully to:', to);
        return result;
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error.message);
        throw error;
    }
}

export const sendWelcomeEmail = async ({ to, data }) => {
    try {
        const {userEmail, userName, uid, joinDate, packageName} = data;
        const { subject, html } = emailTemplates.welcome;
        let htmlContent = html;
        const date = new Date(joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        htmlContent = htmlContent.replace(/{{userEmail}}/g, userEmail || '');
        htmlContent = htmlContent.replace(/{{userName}}/g, userName || '');
        htmlContent = htmlContent.replace(/{{userUid}}/g, uid || '');
        htmlContent = htmlContent.replace(/{{joinDate}}/g, date || '');
        htmlContent = htmlContent.replace(/{{packageName}}/g, packageName || '');
        
        const { data: result, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Thay bằng domain đã verify trên Resend
            to: [to],
            subject: subject,
            html: htmlContent
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        console.log('✅ Welcome email sent successfully to:', to);
        return result;
    } catch (error) {
        console.error('❌ Failed to send Welcome email:', error.message);
        throw error;
    }
}

export const sendSubscriptionExpiringSoonEmail = async ({ to, data }) => {
    try {
        const { subject, html } = emailTemplates.subscriptionExpiryWarning;
        let htmlContent = html;
        htmlContent = htmlContent.replace(/{{user.fullName}}/g, data.fullName || '');
        htmlContent = htmlContent.replace(/{{daysRemaining}}/g, data.daysRemaining || '');
        htmlContent = htmlContent.replace(/{{user._id}}/g, data._id || '');
        htmlContent = htmlContent.replace(/{{packageName}}/g, data.packageName || '');
        
        const { data: result, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Thay bằng domain đã verify trên Resend
            to: [to],
            subject: subject,
            html: htmlContent
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        console.log('✅ Subscription Expiring Soon email sent successfully to:', to);
        return result;
    } catch (error) {
        console.error('❌ Failed to send Subscription Expiring Soon email:', error.message);
        throw error;
    }
}