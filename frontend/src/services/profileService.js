// src/services/profileService.js

export const getMyProfile = async () => {
    try {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (!token) return null;

        const response = await fetch('http://localhost:5000/api/v1/profiles/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            return data.data; // Trả về object chứa avatar_url, full_name, cv_url...
        } else {
            console.warn("API Error:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi lấy profile:", error);
        return null;
    }
};

export const updateMyProfile = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch('http://localhost:5000/api/v1/profiles/me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Lưu ý: Không set Content-Type là application/json vì ta gửi FormData (multipart/form-data)
            },
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            console.warn("Update failed:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật profile:", error);
        throw error;
    }
};