// scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import Models
import Branch from '../src/models/Branch.js';
import Package from '../src/models/Package.js';
import Exercise from '../src/models/Exercise.js';
import DiscountType from '../src/models/DiscountType.js';
import Discount from '../src/models/Discount.js';
import User from '../src/models/User.js';
import Subscription from '../src/models/Subscription.js';
import HealthInfo from '../src/models/HealthInfo.js';
import Schedule from '../src/models/Schedule.js';
import Payment from '../src/models/Payment.js';
import CheckIn from '../src/models/CheckIn.js';
import BookingRequest from '../src/models/BookingRequest.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'stagpower-gym';

const cleanData = async () => {
    console.log(`🧹 Cleaning database: ${MONGODB_DATABASE}...`);
    await Promise.all([
        Branch.deleteMany({}),
        Package.deleteMany({}),
        Exercise.deleteMany({}),
        Discount.deleteMany({}),
        DiscountType.deleteMany({}),
        User.deleteMany({}),
        Subscription.deleteMany({}),
        HealthInfo.deleteMany({}),
        Schedule.deleteMany({}),
        Payment.deleteMany({}),
        CheckIn.deleteMany({}),
        BookingRequest.deleteMany({}),
    ]);
    console.log('✨ Database cleaned.');
};

const seedData = async () => {
    try {
        console.log(`🔌 Connecting to MongoDB... (DB: ${MONGODB_DATABASE})`);
        await mongoose.connect(MONGODB_URI, {
            dbName: MONGODB_DATABASE
        });
        console.log('✅ Connected successfully');

        await cleanData();

        // Ngày hiện tại: 08/12/2025
        const currentDate = new Date(2025, 11, 8); // Month is 0-indexed, so 11 = December
        const getDate = (daysOffset = 0) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + daysOffset);
            return date;
        };
        const getDateMonths = (monthsOffset = 0) => {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() + monthsOffset);
            return date;
        };

        // ==========================================
        // 1. BRANCHES (2 Chi nhánh tại TP.HCM)
        // ==========================================
        console.log('🌱 Seeding Branches...');
        const branches = await Branch.create([
            {
                name: "StagPower Quận 1 (HQ)",
                address: "68 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM",
                openTime: "6:00 AM",
                closeTime: "10:00 PM",
                status: "Active",
                phone: "0901111111",
                email: "quan1@stagpower.com"
            },
            {
                name: "StagPower Quận 7",
                address: "456 Nguyễn Thị Thập, P. Tân Quy, Q.7, TP.HCM",
                openTime: "5:30 AM",
                closeTime: "9:30 PM",
                status: "Active",
                phone: "0907777777",
                email: "quan7@stagpower.com"
            }
        ]);

        // ==========================================
        // 2. DISCOUNT TYPES (Loại giảm giá) - PHẢI SEED TRƯỚC DISCOUNTS
        // ==========================================
        console.log('🌱 Seeding DiscountTypes...');
        const discountTypes = await DiscountType.create([
            {
                name: "HSSV",
                displayName: "Học Sinh Sinh Viên",
                description: "Ưu đãi dành cho học sinh, sinh viên có thẻ còn hạn",
                status: "Active"
            },
            {
                name: "VIP",
                displayName: "VIP Member",
                description: "Ưu đãi dành cho thành viên VIP",
                status: "Active"
            },
            {
                name: "GROUP",
                displayName: "Nhóm",
                description: "Ưu đãi khi đăng ký theo nhóm",
                status: "Active"
            },
            {
                name: "COMPANY",
                displayName: "Công ty",
                description: "Ưu đãi dành cho doanh nghiệp",
                status: "Active"
            },
            {
                name: "VOUCHER",
                displayName: "Voucher",
                description: "Mã giảm giá khuyến mãi",
                status: "Active"
            }
        ]);

        // ==========================================
        // 3. DISCOUNTS (Mã giảm giá)
        // ==========================================
        console.log('🌱 Seeding Discounts...');
        const discounts = await Discount.create([
            {
                name: "Khai trương Quận 7",
                code: "KHAITRUONG_Q7",
                type: "VOUCHER",
                discountPercentage: 20,
                maxDiscount: 1000000,
                minPurchaseAmount: 2000000,
                conditions: "Áp dụng cho gói Membership trên 3 tháng, đơn hàng tối thiểu 2 triệu",
                packageTypes: ["Membership", "Combo"],
                durationTypes: ["MediumTerm", "LongTerm"],
                startDate: getDate(-30), // Bắt đầu 30 ngày trước
                endDate: getDate(30), // Kết thúc 30 ngày sau
                usageLimit: 100,
                usageCount: 15,
                status: "Active"
            },
            {
                name: "Ưu đãi Sinh viên",
                type: "HSSV",
                discountPercentage: 10,
                maxDiscount: 500000,
                minPurchaseAmount: 500000,
                conditions: "Cần thẻ sinh viên còn hạn, áp dụng cho gói Membership",
                packageTypes: ["Membership"],
                durationTypes: ["ShortTerm", "MediumTerm", "LongTerm"],
                startDate: new Date(2025, 0, 1), // 01/01/2025
                endDate: new Date(2025, 11, 31), // 31/12/2025
                usageLimit: null, // Không giới hạn
                usageCount: 45,
                status: "Active"
            },
            {
                name: "Black Friday Sale 2025",
                code: "BLACKFRIDAY_2025",
                type: "VOUCHER",
                discountAmount: 500000,
                minPurchaseAmount: 3000000,
                conditions: "Giảm trực tiếp 500k cho gói PT, đơn hàng tối thiểu 3 triệu",
                packageTypes: ["PT"],
                durationTypes: ["ShortTerm", "MediumTerm", "LongTerm"],
                startDate: getDate(-7), // Bắt đầu 7 ngày trước
                endDate: getDate(7), // Kết thúc 7 ngày sau
                usageLimit: 50,
                usageCount: 12,
                status: "Active"
            },
            {
                name: "Ưu đãi VIP Member",
                type: "VIP",
                discountPercentage: 15,
                maxDiscount: 2000000,
                conditions: "Dành riêng cho thành viên VIP, áp dụng cho tất cả gói",
                packageTypes: ["Membership", "Combo", "PT"],
                durationTypes: [],
                startDate: new Date(2025, 0, 1),
                endDate: new Date(2025, 11, 31),
                usageLimit: null,
                usageCount: 8,
                status: "Active"
            },
            {
                name: "Combo Early Bird",
                code: "EARLY_BIRD_2025",
                type: "VOUCHER",
                discountPercentage: 25,
                maxDiscount: 3000000,
                minPurchaseAmount: 5000000,
                bonusDays: 7,
                conditions: "Đăng ký sớm gói Combo, tặng thêm 7 ngày tập",
                packageTypes: ["Combo"],
                durationTypes: ["MediumTerm", "LongTerm"],
                startDate: getDate(-15),
                endDate: getDate(15),
                usageLimit: 30,
                usageCount: 5,
                status: "Active"
            }
        ]);

        // ==========================================
        // 4. PACKAGES (9 Gói tập)
        // ==========================================
        console.log('🌱 Seeding Packages...');
        const packages = await Package.create([
            // Membership
            {
                name: "1 Tháng Basic",
                type: "Membership",
                packageCategory: "ShortTerm",
                durationMonths: 1,
                membershipType: "Basic",
                price: 600000,
                branchAccess: "Single",
                description: "Tập luyện 1 tháng tại 1 chi nhánh đăng ký",
                status: "Active"
            },
            {
                name: "3 Tháng Tiết Kiệm",
                type: "Membership",
                packageCategory: "ShortTerm",
                durationMonths: 3,
                membershipType: "Basic",
                price: 1500000,
                branchAccess: "Single",
                description: "Gói tiết kiệm cho người mới bắt đầu",
                status: "Active"
            },
            {
                name: "12 Tháng VIP Global",
                type: "Membership",
                packageCategory: "LongTerm",
                durationMonths: 12,
                membershipType: "VIP",
                price: 6000000,
                branchAccess: "All",
                description: "Tập thả ga toàn hệ thống + Khăn + Tủ đồ VIP",
                status: "Active"
            },
            {
                name: "1 Tuần Trải Nghiệm",
                type: "Membership",
                packageCategory: "Trial",
                durationMonths: 1,
                isTrial: true,
                maxTrialDays: 7,
                membershipType: "Basic",
                price: 150000,
                branchAccess: "Single",
                description: "Dành cho khách hàng muốn trải nghiệm thử",
                status: "Active"
            },
            // Combo
            {
                name: "Combo Khởi Động (1 Tháng + 4 PT)",
                type: "Combo",
                packageCategory: "ShortTerm",
                durationMonths: 1,
                membershipType: "Basic",
                price: 2500000,
                ptSessions: 4,
                ptSessionDuration: 60,
                branchAccess: "Single",
                description: "1 tháng tập + 1 buổi PT/tuần để chỉnh kỹ thuật",
                status: "Active"
            },
            {
                name: "Combo Transformation (3 Tháng + 36 PT)",
                type: "Combo",
                packageCategory: "MediumTerm",
                durationMonths: 3,
                membershipType: "VIP",
                price: 18000000,
                ptSessions: 36,
                ptSessionDuration: 60,
                branchAccess: "All",
                description: "Cam kết thay đổi hình thể trong 3 tháng cùng HLV",
                status: "Active"
            },
            // PT Only
            {
                name: "Gói PT 12 Buổi - Kỹ Thuật",
                type: "PT",
                packageCategory: "ShortTerm",
                durationMonths: 2,
                price: 6000000,
                ptSessions: 12,
                ptSessionDuration: 60,
                branchAccess: "All",
                description: "Chỉ bao gồm tập với HLV để học kỹ thuật chuẩn",
                status: "Active"
            },
            {
                name: "Gói PT 50 Buổi - Master",
                type: "PT",
                packageCategory: "LongTerm",
                durationMonths: 12,
                price: 22000000,
                ptSessions: 50,
                ptSessionDuration: 60,
                branchAccess: "All",
                description: "Đồng hành dài hạn cùng HLV chuyên nghiệp",
                status: "Active"
            },
             {
                name: "Gói PT Online Coaching",
                type: "PT",
                packageCategory: "ShortTerm",
                durationMonths: 1,
                price: 3000000,
                ptSessions: 4,
                ptSessionDuration: 45,
                branchAccess: "All",
                description: "Huấn luyện từ xa + Lên thực đơn",
                status: "Inactive"
            }
        ]);

        // ==========================================
        // 5. EXERCISES (Bài tập)
        // ==========================================
        console.log('🌱 Seeding Exercises...');
        const exercises = await Exercise.create([
            // Chest
            { name: "Push Up", description: "Hít đất cơ bản", instructions: "Giữ người thẳng, hạ ngực xuống gần sàn", category: "Chest", difficultyLevel: "Beginner", targetMuscles: ["Pectoralis Major", "Triceps"], equipment: "Bodyweight" },
            { name: "Bench Press", description: "Đẩy tạ nằm", instructions: "Nằm trên ghế, đẩy tạ đòn lên xuống đều đặn", category: "Chest", difficultyLevel: "Intermediate", targetMuscles: ["Pectoralis Major", "Anterior Deltoids", "Triceps"], equipment: "Barbell" },
            { name: "Dumbbell Flyes", description: "Ép ngực tạ đơn", instructions: "Nằm trên ghế, mở rộng tay ra hai bên rồi ép lại", category: "Chest", difficultyLevel: "Intermediate", targetMuscles: ["Pectoralis Major"], equipment: "Dumbbell" },
            // Back
            { name: "Deadlift", description: "Kéo tạ từ sàn", instructions: "Giữ lưng thẳng, dùng hông và chân kéo tạ lên", category: "Back", difficultyLevel: "Advanced", targetMuscles: ["Back", "Hamstrings", "Glutes"], equipment: "Barbell" },
            { name: "Pull Up", description: "Hít xà đơn", instructions: "Treo người lên xà, kéo cằm qua xà", category: "Back", difficultyLevel: "Intermediate", targetMuscles: ["Latissimus Dorsi", "Biceps"], equipment: "Bar" },
            { name: "Bent Over Row", description: "Kéo tạ đòn cúi người", instructions: "Cúi người 45 độ, kéo tạ lên ngang bụng", category: "Back", difficultyLevel: "Intermediate", targetMuscles: ["Latissimus Dorsi", "Rhomboids", "Middle Traps"], equipment: "Barbell" },
            { name: "Lat Pulldown", description: "Kéo cáp ngang", instructions: "Ngồi thẳng, kéo thanh đòn xuống ngang ngực", category: "Back", difficultyLevel: "Beginner", targetMuscles: ["Latissimus Dorsi", "Biceps"], equipment: "Machine" },
            // Legs
            { name: "Barbell Squat", description: "Ngồi xổm gánh tạ đòn", instructions: "Thanh đòn trên vai, hạ hông xuống thấp", category: "Legs", difficultyLevel: "Intermediate", targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"], equipment: "Barbell" },
            { name: "Leg Press", description: "Đạp đùi", instructions: "Ngồi vào máy, đạp bàn đạp ra xa", category: "Legs", difficultyLevel: "Beginner", targetMuscles: ["Quadriceps", "Glutes"], equipment: "Machine" },
            { name: "Romanian Deadlift", description: "Deadlift Rumani", instructions: "Giữ chân thẳng, cúi người xuống kéo tạ", category: "Legs", difficultyLevel: "Intermediate", targetMuscles: ["Hamstrings", "Glutes", "Lower Back"], equipment: "Barbell" },
            { name: "Lunges", description: "Chùng chân", instructions: "Bước một chân về phía trước, hạ người xuống", category: "Legs", difficultyLevel: "Beginner", targetMuscles: ["Quadriceps", "Glutes"], equipment: "Bodyweight" },
            { name: "Leg Curl", description: "Gập chân sau", instructions: "Nằm sấp, gập chân kéo tạ lên", category: "Legs", difficultyLevel: "Beginner", targetMuscles: ["Hamstrings"], equipment: "Machine" },
            // Shoulders
            { name: "Dumbbell Shoulder Press", description: "Đẩy vai tạ đơn", instructions: "Ngồi thẳng, đẩy tạ lên qua đầu", category: "Shoulders", difficultyLevel: "Intermediate", targetMuscles: ["Deltoids", "Triceps"], equipment: "Dumbbell" },
            { name: "Lateral Raise", description: "Nâng tạ ngang", instructions: "Đứng thẳng, nâng tạ đơn ra hai bên ngang vai", category: "Shoulders", difficultyLevel: "Beginner", targetMuscles: ["Lateral Deltoids"], equipment: "Dumbbell" },
            { name: "Front Raise", description: "Nâng tạ trước", instructions: "Đứng thẳng, nâng tạ đơn lên trước mặt", category: "Shoulders", difficultyLevel: "Beginner", targetMuscles: ["Anterior Deltoids"], equipment: "Dumbbell" },
            // Arms
            { name: "Bicep Curl", description: "Cuốn tay trước", instructions: "Đứng thẳng, cuốn tạ đơn lên ngang vai", category: "Arms", difficultyLevel: "Beginner", targetMuscles: ["Biceps"], equipment: "Dumbbell" },
            { name: "Tricep Dips", description: "Hít xà kép", instructions: "Dùng tay đẩy người lên xuống trên xà kép", category: "Arms", difficultyLevel: "Intermediate", targetMuscles: ["Triceps", "Anterior Deltoids"], equipment: "Bodyweight" },
            { name: "Hammer Curl", description: "Cuốn tạ búa", instructions: "Cuốn tạ đơn với lòng bàn tay hướng vào trong", category: "Arms", difficultyLevel: "Beginner", targetMuscles: ["Biceps", "Brachialis"], equipment: "Dumbbell" },
            // Core
            { name: "Plank", description: "Tấm ván", instructions: "Giữ người thẳng trên khuỷu tay", category: "Core", difficultyLevel: "Beginner", targetMuscles: ["Abs", "Core"], equipment: "Bodyweight", duration: 60 },
            { name: "Crunches", description: "Gập bụng", instructions: "Nằm ngửa, gập người lên co bụng", category: "Core", difficultyLevel: "Beginner", targetMuscles: ["Abs"], equipment: "Bodyweight" },
            { name: "Russian Twist", description: "Xoay người Nga", instructions: "Ngồi, xoay người sang hai bên với tạ", category: "Core", difficultyLevel: "Intermediate", targetMuscles: ["Obliques", "Abs"], equipment: "Dumbbell" },
            { name: "Mountain Climber", description: "Leo núi", instructions: "Ở tư thế plank, đổi chân liên tục như đang chạy", category: "Core", difficultyLevel: "Intermediate", targetMuscles: ["Abs", "Core", "Shoulders"], equipment: "Bodyweight", duration: 30 },
            // Cardio
            { name: "Treadmill Run", description: "Chạy bộ máy", instructions: "Chạy tốc độ vừa phải, duy trì nhịp tim", category: "Cardio", difficultyLevel: "Beginner", targetMuscles: ["Legs", "Heart"], equipment: "Machine", duration: 30 },
            { name: "Jump Rope", description: "Nhảy dây", instructions: "Nhảy dây liên tục, giữ nhịp đều", category: "Cardio", difficultyLevel: "Beginner", targetMuscles: ["Legs", "Calves", "Heart"], equipment: "Bodyweight", duration: 15 },
            { name: "Burpees", description: "Burpee toàn thân", instructions: "Hít đất, nhảy lên, lặp lại", category: "Cardio", difficultyLevel: "Advanced", targetMuscles: ["FullBody", "Heart"], equipment: "Bodyweight", duration: 10 },
            { name: "Rowing Machine", description: "Máy chèo thuyền", instructions: "Ngồi trên máy, kéo tay và đạp chân đồng bộ", category: "Cardio", difficultyLevel: "Intermediate", targetMuscles: ["Back", "Legs", "Heart"], equipment: "Machine", duration: 20 },
            // Full Body
            { name: "Kettlebell Swing", description: "Lắc tạ ấm", instructions: "Đứng rộng chân, lắc tạ ấm từ dưới lên ngang vai", category: "FullBody", difficultyLevel: "Intermediate", targetMuscles: ["Glutes", "Hamstrings", "Core", "Shoulders"], equipment: "Kettlebell" },
            { name: "Thruster", description: "Đẩy tạ đứng", instructions: "Squat xuống rồi đẩy tạ lên qua đầu", category: "FullBody", difficultyLevel: "Advanced", targetMuscles: ["Legs", "Shoulders", "Core"], equipment: "Barbell" },
            // Flexibility
            { name: "Yoga Stretch", description: "Giãn cơ Yoga", instructions: "Thực hiện các động tác giãn cơ cơ bản", category: "Flexibility", difficultyLevel: "Beginner", targetMuscles: ["FullBody"], equipment: "Bodyweight", duration: 20 },
            { name: "Hamstring Stretch", description: "Giãn cơ đùi sau", instructions: "Ngồi thẳng, cúi người chạm chân", category: "Flexibility", difficultyLevel: "Beginner", targetMuscles: ["Hamstrings"], equipment: "Bodyweight", duration: 5 }
        ]);

        // ==========================================
        // 6. USERS (Tạo tuần tự để tránh lỗi UID)
        // ==========================================
        console.log('🌱 Seeding Users...');
        const hashedPassword = await bcrypt.hash('123456789', 10);

        const usersData = [
            // --- ADMINS ---
            {
                fullName: "Super Admin", email: "admin@stagpower.com", phone: "0900000000", password: 123456789, role: "admin", status: "active",
                adminInfo: { permissions: ["all"] }, gender: "male", dateOfBirth: new Date("1990-01-01")
            },
            {
                fullName: "Phan Đình Thái", email: "manager.q1@stagpower.com", phone: "0900000001", password: 123456789, role: "admin", status: "active",
                adminInfo: { permissions: ["branch_manager"], branchId: branches[0]._id }, gender: "male", dateOfBirth: new Date("1992-05-15")
            },
            {
                fullName: "Trần Đăng Hiếu", email: "manager.q7@stagpower.com", phone: "0900000002", password: 123456789, role: "admin", status: "active",
                adminInfo: { permissions: ["branch_manager"], branchId: branches[1]._id }, gender: "female", dateOfBirth: new Date("1995-10-20")
            },
            // --- STAFF ---
            {
                fullName: "Lễ Tân Q1 - Mai", email: "staff.q1@stagpower.com", phone: "0900000003", password: 123456789, role: "staff", status: "active",
                staffInfo: { brand_id: branches[0]._id, position: "receptionist" }, gender: "female", dateOfBirth: new Date("2000-01-01")
            },
            {
                fullName: "Lễ Tân Q7 - Lan", email: "staff.q7@stagpower.com", phone: "0900000004", password: 123456789, role: "staff", status: "active",
                staffInfo: { brand_id: branches[1]._id, position: "receptionist" }, gender: "female", dateOfBirth: new Date("2001-02-02")
            },
            // --- TRAINERS ---
            {
                fullName: "HLV Đức (Bodybuilding)", email: "duc.pt@stagpower.com", phone: "0900000005", password: 123456789, role: "trainer", status: "active",
                trainerInfo: { specialty: "Bodybuilding", experience_years: 5, working_hour: ["Morning", "Evening"], certificate: ["NASM", "ACE"] }, gender: "male", dateOfBirth: new Date("1995-06-01")
            },
            {
                fullName: "HLV Linh (Yoga)", email: "linh.yoga@stagpower.com", phone: "0900000006", password: 123456789, role: "trainer", status: "active",
                trainerInfo: { specialty: "Yoga", experience_years: 3, working_hour: ["Morning"], certificate: ["Yoga Alliance"] }, gender: "female", dateOfBirth: new Date("1998-08-08")
            },
            {
                fullName: "HLV Tuấn (Cardio)", email: "tuan.cardio@stagpower.com", phone: "0900000007", password: 123456789, role: "trainer", status: "active",
                trainerInfo: { specialty: "Weight Loss", experience_years: 4, working_hour: ["Afternoon", "Evening"], certificate: ["ISSA"] }, gender: "male", dateOfBirth: new Date("1996-12-12")
            },
            {
                fullName: "HLV Minh (Calisthenics)", email: "minh.calisthenics@stagpower.com", phone: "0900000008", password: 123456789, role: "trainer", status: "active",
                trainerInfo: { specialty: "Calisthenics", experience_years: 6, working_hour: ["Morning", "Afternoon"], certificate: ["NSCA", "CrossFit L1"] }, gender: "male", dateOfBirth: new Date("1994-03-20")
            },
            {
                fullName: "HLV Hương (Pilates)", email: "huong.pilates@stagpower.com", phone: "0900000009", password: 123456789, role: "trainer", status: "active",
                trainerInfo: { specialty: "Pilates", experience_years: 4, working_hour: ["Morning", "Afternoon"], certificate: ["PMA", "Stott Pilates"] }, gender: "female", dateOfBirth: new Date("1997-07-15")
            },
            {
                fullName: "HLV Nam (Powerlifting)", email: "nam.powerlifting@stagpower.com", phone: "0900000010", password: 123456789, role: "trainer", status: "active",
                trainerInfo: { specialty: "Powerlifting", experience_years: 7, working_hour: ["Evening"], certificate: ["USAPL", "IPF"] }, gender: "male", dateOfBirth: new Date("1991-11-30")
            },
            // --- MEMBERS ---
            {
                fullName: "Nguyễn Văn Giàu (VIP)", email: "giau.vip@example.com", phone: "0911111111", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "vip", current_brand_id: branches[0]._id, total_spending: 20000000, qr_code: "QR_VIP_01" }, gender: "male", dateOfBirth: new Date("1985-05-05")
            },
            {
                fullName: "Trần Thị Thường (Regular)", email: "thuong.mem@example.com", phone: "0911111112", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "basic", current_brand_id: branches[1]._id, total_spending: 1500000, qr_code: "QR_REG_01" }, gender: "female", dateOfBirth: new Date("1999-09-09")
            },
            {
                fullName: "Lê Văn Mới (Newbie)", email: "moi.mem@example.com", phone: "0911111113", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "basic", current_brand_id: branches[0]._id, total_spending: 150000, qr_code: "QR_NEW_01" }, gender: "male", dateOfBirth: new Date("2003-03-03")
            },
            {
                fullName: "Phạm Thị Hoa (VIP)", email: "hoa.vip@example.com", phone: "0911111114", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "vip", current_brand_id: branches[1]._id, total_spending: 15000000, qr_code: "QR_VIP_02" }, gender: "female", dateOfBirth: new Date("1990-08-12")
            },
            {
                fullName: "Hoàng Văn Đạt (Regular)", email: "dat.mem@example.com", phone: "0911111115", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "basic", current_brand_id: branches[0]._id, total_spending: 3000000, qr_code: "QR_REG_02" }, gender: "male", dateOfBirth: new Date("1995-12-25")
            },
            {
                fullName: "Võ Thị Lan (Student)", email: "lan.student@example.com", phone: "0911111116", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "basic", current_brand_id: branches[1]._id, total_spending: 600000, qr_code: "QR_STU_01" }, gender: "female", dateOfBirth: new Date("2002-06-18")
            },
            {
                fullName: "Đỗ Văn Long (Regular)", email: "long.mem@example.com", phone: "0911111117", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "basic", current_brand_id: branches[0]._id, total_spending: 4500000, qr_code: "QR_REG_03" }, gender: "male", dateOfBirth: new Date("1988-04-10")
            },
            {
                fullName: "Bùi Thị Mai (VIP)", email: "mai.vip@example.com", phone: "0911111118", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "vip", current_brand_id: branches[1]._id, total_spending: 12000000, qr_code: "QR_VIP_03" }, gender: "female", dateOfBirth: new Date("1992-09-22")
            },
            {
                fullName: "Lý Văn Sơn (Newbie)", email: "son.newbie@example.com", phone: "0911111119", password: 123456789, role: "member", status: "active",
                memberInfo: { membership_level: "basic", current_brand_id: branches[0]._id, total_spending: 0, qr_code: "QR_NEW_02" }, gender: "male", dateOfBirth: new Date("2001-01-15")
            }
        ];

        const createdUsers = [];
        for (const data of usersData) {
            createdUsers.push(await User.create(data));
        }

        // Helper lấy user từ mảng đã tạo
        const findUser = (email) => createdUsers.find(u => u.email === email);
        const vipMember = findUser("giau.vip@example.com");
        const regularMember = findUser("thuong.mem@example.com");
        const newbieMember = findUser("moi.mem@example.com");
        const ptBody = findUser("duc.pt@stagpower.com");
        const ptYoga = findUser("linh.yoga@stagpower.com");

        // ==========================================
        // 7. SUBSCRIPTIONS
        // ==========================================
        console.log('🌱 Seeding Subscriptions...');
        
        // VIP: Combo Transformation (Active) - Bắt đầu 10 ngày trước, còn 80 ngày
        const subVipActive = await Subscription.create({
            memberId: vipMember._id, packageId: packages[5]._id, branchId: branches[0]._id, type: "Combo", membershipType: "VIP",
            startDate: getDate(-10), endDate: getDateMonths(3),
            durationDays: 90, ptsessionsRemaining: 35, ptsessionsUsed: 1, status: "Active"
        });
        
        // VIP: Gói cũ đã hết hạn (2 tháng trước - 1 tháng trước)
        const subVipExpired = await Subscription.create({
            memberId: vipMember._id, packageId: packages[0]._id, branchId: branches[0]._id, type: "Membership", membershipType: "Basic",
            startDate: getDateMonths(-2), endDate: getDateMonths(-1),
            durationDays: 30, status: "Expired"
        });

        // Regular: 3 Tháng Basic (Active) - Bắt đầu 30 ngày trước, còn 60 ngày
        const subRegular = await Subscription.create({
            memberId: regularMember._id, packageId: packages[1]._id, branchId: branches[1]._id, type: "Membership", membershipType: "Basic",
            startDate: getDate(-30), endDate: getDateMonths(2),
            durationDays: 90, status: "Active"
        });

        // Newbie: Trial (Active) - Bắt đầu hôm nay, còn 7 ngày
        const subNewbie = await Subscription.create({
            memberId: newbieMember._id, packageId: packages[3]._id, branchId: branches[0]._id, type: "Membership", membershipType: "Basic",
            startDate: currentDate, endDate: getDate(7),
            durationDays: 7, status: "Active"
        });

        // ==========================================
        // 8. HEALTH INFO (Full data)
        // ==========================================
        console.log('🌱 Seeding HealthInfo...');
        
        // VIP Member: Có 2 bản ghi để test lịch sử
        // Bản ghi cũ (1 tháng trước)
        await HealthInfo.create({
            memberId: vipMember._id, height: 175, weight: 85, bmi: 27.7, bodyFatPercent: 25, muscleMass: 33,
            goal: "musclegain", experience: "beginner", fitnessLevel: "low", healthScore: 65, healthStatus: "fair",
            createdAt: getDateMonths(-1)
        });
        // Bản ghi mới (Hiện tại)
        await HealthInfo.create({
            memberId: vipMember._id, height: 175, weight: 80, bmi: 26.1, bodyFatPercent: 22, muscleMass: 35,
            visceralFatLevel: 8, waterPercent: 55, boneMass: 3.5, basalMetabolicRate: 1800,
            inBodyScore: 78,
            segmentalLeanAnalysis: { leftArm: { mass: 3.5, percent: 105 }, rightArm: { mass: 3.6, percent: 108 }, leftLeg: { mass: 9.5, percent: 102 }, rightLeg: { mass: 9.6, percent: 103 } },
            goal: "musclegain", experience: "intermediate", fitnessLevel: "medium", healthScore: 78, healthStatus: "good",
            medicalHistory: "Đau lưng nhẹ", allergies: "Hải sản", sleepHours: 7, stressLevel: "medium"
        });

        // Regular Member
        await HealthInfo.create({
            memberId: regularMember._id, height: 160, weight: 50, bmi: 19.5, bodyFatPercent: 24,
            goal: "health", experience: "beginner", fitnessLevel: "medium", healthScore: 82, healthStatus: "excellent",
            weeklySessions: "3-4", dietType: "balanced"
        });

        // ==========================================
        // 9. SCHEDULES
        // ==========================================
        console.log('🌱 Seeding Schedules...');
        
        // VIP + PT Body (3 buổi)
        // Buổi 1: Đã xong (2 ngày trước)
        await Schedule.create({
            memberId: vipMember._id, trainerId: ptBody._id, subscriptionId: subVipActive._id, branchId: branches[0]._id,
            dateTime: getDate(-2), durationMinutes: 60, status: "Completed",
            notes: "Buổi 1: Test thể lực", assignedExercises: [{ exerciseId: exercises[0]._id }]
        });
        // Buổi 2: Sắp tới (Ngày mai)
        await Schedule.create({
            memberId: vipMember._id, trainerId: ptBody._id, subscriptionId: subVipActive._id, branchId: branches[0]._id,
            dateTime: getDate(1), durationMinutes: 60, status: "Confirmed",
            notes: "Buổi 2: Leg Day", assignedExercises: [{ exerciseId: exercises[1]._id }]
        });
        // Buổi 3: Tuần sau (Pending)
        await Schedule.create({
            memberId: vipMember._id, trainerId: ptBody._id, subscriptionId: subVipActive._id, branchId: branches[0]._id,
            dateTime: getDate(7), durationMinutes: 60, status: "Pending",
            notes: "Buổi 3: Upper Body"
        });

        // ==========================================
        // 10. PAYMENTS
        // ==========================================
        console.log('🌱 Seeding Payments...');
        
        // VIP Payment (MoMo) - Đã dùng discount VIP
        const vipDiscount = discounts.find(d => d.type === 'VIP');
        // Tính discount: 15% của 18 triệu = 2.7 triệu, nhưng maxDiscount = 2 triệu
        const discountAmount = Math.min(18000000 * 0.15, 2000000); // = 2 triệu
        await Payment.create({
            subscriptionId: subVipActive._id, memberId: vipMember._id, 
            originalAmount: 18000000, 
            amount: 18000000 - discountAmount, // = 16 triệu
            paymentMethod: "Momo", 
            paymentStatus: "Completed", 
            paymentDate: getDate(-10), // Thanh toán 10 ngày trước
            paymentType: "NEW_SUBSCRIPTION",
            invoiceNumber: `INV${Date.now()}_VIP`, 
            transactionId: "MOMO123456789",
            discountDetails: [{
                discountId: vipDiscount._id,
                type: vipDiscount.type,
                discountPercentage: vipDiscount.discountPercentage,
                discountAmount: discountAmount, // 2 triệu (đã áp dụng maxDiscount)
                description: vipDiscount.conditions,
                appliedAt: getDate(-10)
            }]
        });
        
        // Regular Payment (Cash) - Không dùng discount
        await Payment.create({
            subscriptionId: subRegular._id, memberId: regularMember._id, 
            originalAmount: 1500000, 
            amount: 1500000,
            paymentMethod: "Cash", 
            paymentStatus: "Completed", 
            paymentDate: getDate(-30), // Thanh toán 30 ngày trước
            paymentType: "NEW_SUBSCRIPTION", 
            invoiceNumber: `INV${Date.now()}_REG`, 
            notes: "Thanh toán tại quầy"
        });

        // Newbie Payment (Pending) - Chưa thanh toán
        await Payment.create({
            subscriptionId: subNewbie._id, memberId: newbieMember._id, 
            originalAmount: 150000, 
            amount: 150000,
            paymentMethod: "Momo", 
            paymentStatus: "Pending", 
            dueDate: getDate(1), // Hạn thanh toán ngày mai
            paymentType: "NEW_SUBSCRIPTION", 
            invoiceNumber: `INV${Date.now()}_NEW`
        });

        // ==========================================
        // 11. CHECK-INS (History)
        // ==========================================
        console.log('🌱 Seeding CheckIns...');
        // VIP: Check-in 2 ngày trước (đã checkout)
        const checkInTime1 = new Date(getDate(-2));
        checkInTime1.setHours(18, 0, 0, 0); // 6:00 PM
        const checkOutTime1 = new Date(checkInTime1);
        checkOutTime1.setMinutes(checkOutTime1.getMinutes() + 90);
        await CheckIn.create({
            memberId: vipMember._id, branchId: branches[0]._id, checkInMethod: "QR_Code", status: "Completed", duration: 90,
            checkInTime: checkInTime1, checkOutTime: checkOutTime1
        });
        
        // VIP đang tập (Chưa checkout) - Check-in hôm nay lúc 7:00 AM
        const checkInTime2 = new Date(currentDate);
        checkInTime2.setHours(7, 0, 0, 0);
        await CheckIn.create({
            memberId: vipMember._id, branchId: branches[0]._id, checkInMethod: "QR_Code", status: "Active",
            checkInTime: checkInTime2
        });

        // Regular: Check-in tại Q7 hôm qua (đã checkout)
        const checkInTime3 = new Date(getDate(-1));
        checkInTime3.setHours(19, 30, 0, 0); // 7:30 PM
        const checkOutTime3 = new Date(checkInTime3);
        checkOutTime3.setMinutes(checkOutTime3.getMinutes() + 60);
        await CheckIn.create({
            memberId: regularMember._id, branchId: branches[1]._id, checkInMethod: "Card", status: "Completed", duration: 60,
            checkInTime: checkInTime3, checkOutTime: checkOutTime3
        });

        // ==========================================
        // 12. BOOKING REQUESTS
        // ==========================================
        console.log('🌱 Seeding Booking Requests...');
        // VIP request Yoga PT - 3 ngày sau
        const bookingDateTime1 = new Date(getDate(3));
        bookingDateTime1.setHours(10, 0, 0, 0); // 10:00 AM
        await BookingRequest.create({
            memberId: vipMember._id, trainerId: ptYoga._id, subscriptionId: subVipActive._id,
            requestDateTime: bookingDateTime1, duration: 60,
            status: "Pending", notes: "Muốn học giãn cơ sau buổi tập chân nặng"
        });

        // Newbie request (Bị từ chối do HLV bận) - 2 ngày sau
        const bookingDateTime2 = new Date(getDate(2));
        bookingDateTime2.setHours(14, 0, 0, 0); // 2:00 PM
        await BookingRequest.create({
            memberId: newbieMember._id, trainerId: ptBody._id, subscriptionId: subNewbie._id,
            requestDateTime: bookingDateTime2, duration: 60,
            status: "Rejected", rejectReason: "HLV bận lịch đột xuất"
        });

        console.log('✅ Database seeded successfully to ' + MONGODB_DATABASE);
        console.log('🔑 Default Password for all users: 123456789');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

// chạy lệnh node -r @babel/register scripts/seed.js để chạy script