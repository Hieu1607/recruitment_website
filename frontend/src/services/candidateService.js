import api from './api';
import profileService from './profileService'; // Import file bạn vừa gửi

const ROLE_CANDIDATE = 3;

export const getAllCandidates = async () => {
    try {
        // BƯỚC 1: Lấy danh sách Tài khoản User từ hệ thống
        const response = await api.get('/v1/users');
        const allUsers = response.data.data || response.data || [];

        // BƯỚC 2: Lọc ra danh sách những người là Ứng viên (Role = 3)
        const candidateUsers = allUsers.filter(user => user.role_id === ROLE_CANDIDATE);

        // BƯỚC 3: Lấy chi tiết Profile của từng người (Gộp thông tin)
        // Sử dụng Promise.all để chạy song song cho nhanh
        const fullCandidates = await Promise.all(candidateUsers.map(async (user) => {
            // Gọi API lấy hồ sơ chi tiết dựa vào user.id
            const profile = await profileService.getProfileByUserId(user.id);
            
            // Gộp thông tin: Ưu tiên thông tin trong Profile (Họ tên, ảnh, sđt)
            // Nếu Profile chưa cập nhật (null) thì dùng tạm thông tin User
            return {
                ...user,            // Giữ lại id, email, role_id gốc
                ...profile,         // Ghi đè bằng full_name, phone, address, avatar_url từ Profile
                
                // Xử lý hiển thị tên: Nếu có full_name trong profile thì dùng, không thì dùng name của user
                name: profile?.full_name || user.name || "Chưa cập nhật tên",
                
                // Xử lý avatar
                avatar_url: profile?.avatar_url || user.avatar_url,
                
                // Xử lý SĐT
                phone: profile?.phone || user.phone || ""
            };
        }));

        return fullCandidates;

    } catch (error) {
        console.error("Lỗi lấy danh sách ứng viên:", error);
        return [];
    }
};