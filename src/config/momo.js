import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
const endpoint = 'https://test-payment.momo.vn';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
export const momoConfig = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    orderInfo: 'pay with MoMo',
    partnerCode: 'MOMO',
    redirectUrl: 'http://localhost:3000/',
    // ipnUrl: 'https://fb4206e827d9.ngrok-free.app/api/payments/momo/ipn',
    ipnUrl: `${SERVER_URL}/api/payments/momo/ipn` || 'https://fb4206e827d9.ngrok-free.app/api/payments/momo/ipn',
    requestType: "captureWallet",
    extraData: '',
    paymentCode: 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==',
    orderGroupId: '',
    autoCapture: true,
    lang: 'vi',
}



export const createMomoPayment = async (amount, orderId, requestId) => {
    const { accessKey, secretKey, orderInfo, partnerCode, redirectUrl, ipnUrl, requestType, extraData, paymentCode, orderGroupId, autoCapture, lang } = momoConfig;
    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const momoRequest = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: 'Momo',
        storeId: 'GymStore',
        requestId: requestId,
        amount: String(amount),
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
        expireTime: 300000
    })
    const response = await axios.post(`${endpoint}/v2/gateway/api/create`, momoRequest, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    return response.data
}


/*{
    partnerCode: 'MOMO',đá
    orderId: 'MOMO1712108682648',dá
    requestId: 'MOMO1712108682648',á
    amount: 10000,dá
    orderInfo: 'pay with MoMo',dá
    orderType: 'momo_wallet',
    transId: 4014083433,
    resultCode: 0,
    message: 'Thành công.',
    payType: 'qr',
    responseTime: 1712108811069,
    extraData: '',
    signature: '10398fbe70cd3052f443da99f7c4befbf49ab0d0c6cd7dc14efffd6e09a526c0'
  }*/
export function verifyIpnSignature(payload) {
    const { secretKey, accessKey } = momoConfig;
    const rawSignature =
        `accessKey=${accessKey}` +
        `&amount=${payload.amount}` +
        `&extraData=${payload.extraData || ''}` +
        `&message=${payload.message || ''}` +
        `&orderId=${payload.orderId}` +
        `&orderInfo=${payload.orderInfo || ''}` +
        `&orderType=${payload.orderType || ''}` +
        `&partnerCode=${payload.partnerCode}` +
        `&payType=${payload.payType || ''}` +
        `&requestId=${payload.requestId}` +
        `&responseTime=${payload.responseTime}` +
        `&resultCode=${payload.resultCode}` +
        `&transId=${payload.transId || ''}`;

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    return signature === payload.signature;
}

// orderId is _idPayment
// requestId is invoiceNumber
export const queryMomoTransaction = async (orderId, requestId) => {
    const { accessKey, secretKey, partnerCode } = momoConfig;

    const rawSignature = 
        `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const body = {
        partnerCode,
        requestId,
        orderId,
        signature,
        lang: "vi"
    };

    const response = await axios.post(`${endpoint}/v2/gateway/api/query`, body, {
        headers: { "Content-Type": "application/json" }
    });

    return response.data;
}
