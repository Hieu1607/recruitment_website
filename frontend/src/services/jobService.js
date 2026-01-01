import api from './api';

// Hàm map dữ liệu để tránh lỗi khi backend trả về thiếu trường
const mapJobData = (apiJob) => {
  if (!apiJob) return {};

  return {
    id: apiJob.id || apiJob.id_cong_viec || Math.random().toString(),
    title: apiJob.title || apiJob.ten_cong_viec || "Công việc chưa có tên",
    
    // --- KHÔI PHỤC TRƯỜNG ID CÔNG TY ĐỂ DỰ PHÒNG ---
    companyId: apiJob.company_id || apiJob.id_cong_ty || null,

    // Lấy tên nếu có sẵn
    companyName: apiJob.company_name || apiJob.ten_cong_ty || null,
    
    salary: apiJob.salary || apiJob.muc_luong || "Thỏa thuận",
    location: (apiJob.location || apiJob.dia_diem_lam_viec || "").toString(),
    level: apiJob.level || "",
    deadline: apiJob.deadline || apiJob.thoi_han_tuyen_dung || "",
    companyType: apiJob.company_type || apiJob.loai_hinh_hoat_dong || "",

    // --- CÁC TRƯỜNG MỚI CHO TRANG CHI TIẾT ---
    description: apiJob.description || apiJob.mo_ta || "Chưa có mô tả chi tiết",
    requirements: apiJob.requirements || apiJob.yeu_cau || "Chưa có yêu cầu cụ thể",
    benefits: apiJob.benefits || apiJob.quyen_loi || "Chưa có thông tin quyền lợi"
  };
};

const jobService = {
  // 1. Lấy danh sách việc làm (Giữ nguyên logic limit 10000 của bạn)
  getJobs: async (keyword = '', location = 'all') => {
    try {
      const params = {
        limit: 10000,     
      };
      
      if (keyword) { params.search = keyword; params.keyword = keyword; }
      if (location !== 'all') params.location = location;

      console.log("Đang gọi API với params:", params);

      const response = await api.get('/v1/jobs', { params });
      
      const rawJobs = response.data.data || response.data.jobs || response.data || [];

      if (!Array.isArray(rawJobs)) return [];
      return rawJobs.map(mapJobData);
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  // 2. Lấy gợi ý (Giữ nguyên)
  getSuggestions: async () => {
    try {
      const response = await api.get('/v1/jobs', { params: { limit: 5 } });
      const rawJobs = response.data.data || response.data || [];
      if (!Array.isArray(rawJobs)) return { keywords: [], jobs: [] };

      const keywords = rawJobs
        .map(job => job.title || job.ten_cong_viec)
        .filter(k => k)
        .slice(0, 5);

      return {
        keywords: keywords,
        jobs: rawJobs.slice(0, 3).map(mapJobData)
      };
    } catch (error) {
      return { keywords: [], jobs: [] };
    }
  },

  // --- MỚI 1: Lấy chi tiết 1 công việc theo ID ---
  getJobById: async (id) => {
    try {
      const response = await api.get(`/v1/jobs/${id}`);
      // Lấy data raw và map lại cho chuẩn
      const rawJob = response.data.data || response.data;
      return mapJobData(rawJob);
    } catch (error) {
      console.error("Lỗi lấy chi tiết job:", error);
      return null;
    }
  },

  // --- MỚI 2: Gửi hồ sơ ứng tuyển (Upload CV) ---
  applyJob: async (jobId, file) => {
    try {
      // Phải dùng FormData để gửi file
      const formData = new FormData();
      formData.append('cv', file);       
      formData.append('job_id', jobId);  

      const response = await api.post('/v1/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Bắt buộc dòng này
        },
      });
      return response.data;
    } catch (error) {
      throw error; // Ném lỗi ra để component hiển thị thông báo
    }
  }
};

export default jobService;