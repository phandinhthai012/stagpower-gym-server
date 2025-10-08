const generateOtp = (length = 6) => {
    const max = 10 ** length;
    return String(Math.floor(Math.random() * max)).padStart(length, '0');
};

export const createOtp = () => {
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return {
        code: code,
        expiresAt: expiresAt,
        isUsed: false
    }
}

export const isExpired = (expiresAt) => {
    return !expiresAt || new Date(expiresAt).getTime() < Date.now();
}

export const compareOtp = (inputOtp, userOtp) => {
    return inputOtp === userOtp;
}
