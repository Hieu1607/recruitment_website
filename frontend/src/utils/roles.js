// src/utils/roles.js

// SỬA CÁC SỐ NÀY CHO KHỚP VỚI DATABASE CỦA BẠN
export const ROLE_ID = {
  ADMIN: 1,        // Ví dụ: ID 1 là Admin
  EMPLOYER: 2,     // Ví dụ: ID 2 là Nhà tuyển dụng ("Thằng User")
  JOB_SEEKER: 3    // Ví dụ: ID 3 là Ứng viên ("Thằng Jobseeker")
};

// Hàm tiện ích để check nhanh (dùng ở giao diện)
export const isEmployer = (user) => user?.role_id === ROLE_ID.EMPLOYER;
export const isJobSeeker = (user) => user?.role_id === ROLE_ID.JOB_SEEKER;
export const isAdmin = (user) => user?.role_id === ROLE_ID.ADMIN;