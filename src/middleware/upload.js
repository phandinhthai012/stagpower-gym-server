import multer from 'multer'; // cài đặt multer để upload file

// Cấu hình lưu file vào bộ nhớ (memory) để xử lý
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

export default upload;
