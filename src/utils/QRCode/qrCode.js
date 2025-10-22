import QRCode from 'qrcode';
import crypto from 'crypto';
import User from '../../models/User';
import Subscription from '../../models/Subscription';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export const generateQRCode = async (data) => {
    try {
        const {
            memberId,
            memberName,
        } = data;

        const member = await User.findById(memberId);
        if(!member){
            throw new Error('Member not found');
        }
        // console.log(member);
        const subscriptions = await Subscription.find({
            memberId: member._id,
            type: { $in: ['Membership', 'Combo'] }
        });
        // console.log(subscriptions);
        const activeSubscription = subscriptions.find(sub => sub.isActive());
        if (!activeSubscription) {
            throw new Error('Member does not have an active subscription Membership or Combo, maybe suspended or expired');
        }

        console.log(activeSubscription);
        const timestamp = Date.now();
        const expiresAt = timestamp + 1000 * 60 * 30; // hết hạn trong 30p
        const qrCodeData = {
            memberId,
            expiresAt,
        };

        const token = jwt.sign(qrCodeData, SECRET_KEY,{
            expiresIn: '30m'
        });

        console.log(token);

        const qrCodeDataUrl = QRCode.toDataURL(token, {
            width: 300,
            height: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });
        return qrCodeDataUrl;
    } catch (error) {
        throw new Error('Failed to generate QR code: ' + error.message);
    }
}


// const generateSignature = async (data) => {
//     const signature = crypto.createHmac('sha256', SECRET_KEY).update(JSON.stringify(data)).digest('hex');
//     return signature;
// }

// // Kiểm tra signature
// export const verifySignature = (qrData) => {
//     try {
//         // Parse QR data
//         const data = JSON.parse(qrData);

//         // Tách signature ra khỏi data
//         const { signature, ...dataWithoutSignature } = data;

//         // Tạo signature mới từ data không chứa signature
//         const expectedSignature = crypto.createHmac('sha256', SECRET_KEY)
//             .update(JSON.stringify(dataWithoutSignature))
//             .digest('hex');

//         // So sánh signature
//         if (signature !== expectedSignature) {
//             return {
//                 isValid: false,
//                 error: 'Invalid signature - QR Code may have been tampered with'
//             };
//         }

//         return {
//             isValid: true,
//             data: dataWithoutSignature
//         };
//     } catch (error) {
//         return {
//             isValid: false,
//             error: 'Invalid QR Code format: ' + error.message
//         };
//     }
// }

// Kiểm tra QR Code hoàn chỉnh (signature + hết hạn)
export const validateQRCode = (token) => {
    try {
        const decodedPayload  = jwt.verify(token, SECRET_KEY);
        return {
            isValid: true,
            data: decodedPayload
        }
    } catch (error) {
        let errorMessage = 'Invalid QR Code';
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'QR Code has expired';
        } else if (error.name === 'JsonWebTokenError') {
            // Lỗi này bao gồm cả sai signature, sai định dạng...
            errorMessage = 'Invalid QR Code signature';
        }
        
        return {
            isValid: false,
            error: errorMessage
        };
    }
}
