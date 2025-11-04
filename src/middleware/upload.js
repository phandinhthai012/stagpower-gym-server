import multer from 'multer'; // cài đặt multer để upload file

// Cấu hình lưu file vào bộ nhớ (memory) để xử lý
const storage = multer.memoryStorage();

// File filter - chỉ accept PDF
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận file PDF (.pdf)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB (tăng từ 5MB vì PDF có thể lớn hơn)
    fileFilter: fileFilter
});

export default upload;
