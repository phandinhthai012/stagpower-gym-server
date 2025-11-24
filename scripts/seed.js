// scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import Models
import Branch from '../src/models/Branch.js';
import Package from '../src/models/Package.js';
import Exercise from '../src/models/Exercise.js';
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
        // 2. DISCOUNTS (Mã giảm giá)
        // ==========================================
        console.log('🌱 Seeding Discounts...');
        const discounts = await Discount.create([
            {
                name: "Khai trương Quận 7",
                type: "Voucher",
                discountPercentage: 20,
                maxDiscount: 1000000,
                conditions: "Áp dụng cho gói Membership trên 3 tháng",
                packageTypes: ["Membership", "Combo"],
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                status: "Active"
            },
            {
                name: "Ưu đãi Sinh viên",
                type: "HSSV",
                discountPercentage: 10,
                maxDiscount: 500000,
                conditions: "Cần thẻ sinh viên còn hạn",
                packageTypes: ["Membership"],
                startDate: new Date(2024, 0, 1),
                endDate: new Date(2025, 12, 31),
                status: "Active"
            },
            {
                name: "Black Friday Sale",
                type: "Voucher",
                discountAmount: 500000,
                conditions: "Giảm trực tiếp 500k cho gói PT",
                packageTypes: ["PT"],
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                status: "Active"
            }
        ]);

        // ==========================================
        // 3. PACKAGES (9 Gói tập)
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
        // 4. EXERCISES (Bài tập)
        // ==========================================
        console.log('🌱 Seeding Exercises...');
        const exercises = await Exercise.create([
            { name: "Push Up", description: "Hít đất cơ bản", instructions: "Giữ người thẳng, hạ ngực xuống gần sàn", category: "Chest", difficultyLevel: "Beginner", targetMuscles: ["Pectoralis Major", "Triceps"], equipment: "Bodyweight" },
            { name: "Barbell Squat", description: "Ngồi xổm gánh tạ đòn", instructions: "Thanh đòn trên vai, hạ hông xuống thấp", category: "Legs", difficultyLevel: "Intermediate", targetMuscles: ["Quadriceps", "Glutes"], equipment: "Barbell" },
            { name: "Deadlift", description: "Kéo tạ từ sàn", instructions: "Giữ lưng thẳng, dùng hông và chân kéo tạ lên", category: "Back", difficultyLevel: "Advanced", targetMuscles: ["Back", "Hamstrings"], equipment: "Barbell" },
            { name: "Plank", description: "Tấm ván", instructions: "Giữ người thẳng trên khuỷu tay", category: "Core", difficultyLevel: "Beginner", targetMuscles: ["Abs"], equipment: "Bodyweight", duration: 60 },
            { name: "Treadmill Run", description: "Chạy bộ máy", instructions: "Chạy tốc độ vừa phải", category: "Cardio", difficultyLevel: "Beginner", targetMuscles: ["Legs", "Heart"], equipment: "Machine", duration: 30 },
            { name: "Pull Up", description: "Hít xà đơn", instructions: "Treo người lên xà, kéo cằm qua xà", category: "Back", difficultyLevel: "Intermediate", targetMuscles: ["Latissimus Dorsi", "Biceps"], equipment: "Bar" },
            { name: "Dumbbell Shoulder Press", description: "Đẩy vai tạ đơn", instructions: "Ngồi thẳng, đẩy tạ lên qua đầu", category: "Shoulders", difficultyLevel: "Intermediate", targetMuscles: ["Deltoids"], equipment: "Dumbbell" },
            { name: "Leg Press", description: "Đạp đùi", instructions: "Ngồi vào máy, đạp bàn đạp ra xa", category: "Legs", difficultyLevel: "Beginner", targetMuscles: ["Quadriceps"], equipment: "Machine" }
        ]);

        // ==========================================
        // 5. USERS (Tạo tuần tự để tránh lỗi UID)
        // ==========================================
        console.log('🌱 Seeding Users...');
        const hashedPassword = await bcrypt.hash('123456', 10);

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
        // 6. SUBSCRIPTIONS
        // ==========================================
        console.log('🌱 Seeding Subscriptions...');
        
        // VIP: Combo Transformation (Active) + Gói cũ đã hết hạn
        const subVipActive = await Subscription.create({
            memberId: vipMember._id, packageId: packages[5]._id, branchId: branches[0]._id, type: "Combo", membershipType: "VIP",
            startDate: new Date(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            durationDays: 90, ptsessionsRemaining: 35, ptsessionsUsed: 1, status: "Active"
        });
        
        const subVipExpired = await Subscription.create({
            memberId: vipMember._id, packageId: packages[0]._id, branchId: branches[0]._id, type: "Membership", membershipType: "Basic",
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)), endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            durationDays: 30, status: "Expired"
        });

        // Regular: 3 Tháng Basic (Active)
        const subRegular = await Subscription.create({
            memberId: regularMember._id, packageId: packages[1]._id, branchId: branches[1]._id, type: "Membership", membershipType: "Basic",
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)), endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
            durationDays: 90, status: "Active"
        });

        // Newbie: Trial (Active)
        const subNewbie = await Subscription.create({
            memberId: newbieMember._id, packageId: packages[3]._id, branchId: branches[0]._id, type: "Membership", membershipType: "Basic",
            startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            durationDays: 7, status: "Active"
        });

        // ==========================================
        // 7. HEALTH INFO (Full data)
        // ==========================================
        console.log('🌱 Seeding HealthInfo...');
        
        // VIP Member: Có 2 bản ghi để test lịch sử
        // Bản ghi cũ (1 tháng trước)
        await HealthInfo.create({
            memberId: vipMember._id, height: 175, weight: 85, bmi: 27.7, bodyFatPercent: 25, muscleMass: 33,
            goal: "musclegain", experience: "beginner", fitnessLevel: "low", healthScore: 65, healthStatus: "fair",
            createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1))
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
        // 8. SCHEDULES
        // ==========================================
        console.log('🌱 Seeding Schedules...');
        
        // VIP + PT Body (3 buổi)
        // Buổi 1: Đã xong (2 ngày trước)
        await Schedule.create({
            memberId: vipMember._id, trainerId: ptBody._id, subscriptionId: subVipActive._id, branchId: branches[0]._id,
            dateTime: new Date(new Date().setDate(new Date().getDate() - 2)), durationMinutes: 60, status: "Completed",
            notes: "Buổi 1: Test thể lực", assignedExercises: [{ exerciseId: exercises[0]._id }]
        });
        // Buổi 2: Sắp tới (Ngày mai)
        await Schedule.create({
            memberId: vipMember._id, trainerId: ptBody._id, subscriptionId: subVipActive._id, branchId: branches[0]._id,
            dateTime: new Date(new Date().setDate(new Date().getDate() + 1)), durationMinutes: 60, status: "Confirmed",
            notes: "Buổi 2: Leg Day", assignedExercises: [{ exerciseId: exercises[1]._id }]
        });
        // Buổi 3: Tuần sau (Pending)
        await Schedule.create({
            memberId: vipMember._id, trainerId: ptBody._id, subscriptionId: subVipActive._id, branchId: branches[0]._id,
            dateTime: new Date(new Date().setDate(new Date().getDate() + 7)), durationMinutes: 60, status: "Pending",
            notes: "Buổi 3: Upper Body"
        });

        // ==========================================
        // 9. PAYMENTS
        // ==========================================
        console.log('🌱 Seeding Payments...');
        // VIP Payment (MoMo)
        await Payment.create({
            subscriptionId: subVipActive._id, memberId: vipMember._id, originalAmount: 18000000, amount: 18000000,
            paymentMethod: "Momo", paymentStatus: "Completed", paymentDate: new Date(), paymentType: "NEW_SUBSCRIPTION",
            invoiceNumber: `INV${Date.now()}_VIP`, transactionId: "MOMO123456789"
        });
        
        // Regular Payment (Cash)
        await Payment.create({
            subscriptionId: subRegular._id, memberId: regularMember._id, originalAmount: 1500000, amount: 1500000,
            paymentMethod: "Cash", paymentStatus: "Completed", paymentDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            paymentType: "NEW_SUBSCRIPTION", invoiceNumber: `INV${Date.now()}_REG`, notes: "Thanh toán tại quầy"
        });

        // Newbie Payment (Pending)
        await Payment.create({
            subscriptionId: subNewbie._id, memberId: newbieMember._id, originalAmount: 150000, amount: 150000,
            paymentMethod: "Momo", paymentStatus: "Pending", dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            paymentType: "NEW_SUBSCRIPTION", invoiceNumber: `INV${Date.now()}_NEW`
        });

        // ==========================================
        // 10. CHECK-INS (History)
        // ==========================================
        console.log('🌱 Seeding CheckIns...');
        // VIP: Check-in tuần trước và hôm nay
        await CheckIn.create({
            memberId: vipMember._id, branchId: branches[0]._id, checkInMethod: "QR_Code", status: "Completed", duration: 90,
            checkInTime: new Date(new Date().setDate(new Date().getDate() - 2)), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 2) + 90*60000)
        });
        // VIP đang tập (Chưa checkout)
        await CheckIn.create({
            memberId: vipMember._id, branchId: branches[0]._id, checkInMethod: "QR_Code", status: "Active",
            checkInTime: new Date() // Vừa check-in
        });

        // Regular: Check-in tại Q7
        await CheckIn.create({
            memberId: regularMember._id, branchId: branches[1]._id, checkInMethod: "Card", status: "Completed", duration: 60,
            checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1) + 60*60000)
        });

        // ==========================================
        // 11. BOOKING REQUESTS
        // ==========================================
        console.log('🌱 Seeding Booking Requests...');
        // VIP request Yoga PT
        await BookingRequest.create({
            memberId: vipMember._id, trainerId: ptYoga._id, subscriptionId: subVipActive._id,
            requestDateTime: new Date(new Date().setDate(new Date().getDate() + 3)), duration: 60,
            status: "Pending", notes: "Muốn học giãn cơ sau buổi tập chân nặng"
        });

        // Newbie request (Bị từ chối do HLV bận)
        await BookingRequest.create({
            memberId: newbieMember._id, trainerId: ptBody._id, subscriptionId: subNewbie._id, // Giả sử trial k được book PT nhưng cứ seed để test logic
            requestDateTime: new Date(new Date().setDate(new Date().getDate() + 2)), duration: 60,
            status: "Rejected", rejectReason: "HLV bận lịch đột xuất"
        });

        console.log('✅ Database seeded successfully to ' + MONGODB_DATABASE);
        console.log('🔑 Default Password for all users: 123456');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

// chạy lệnh node -r @babel/register scripts/seed.js để chạy script