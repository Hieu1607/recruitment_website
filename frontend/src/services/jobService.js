import api from './api';

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
    companyType: apiJob.company_type || apiJob.loai_hinh_hoat_dong || ""
  };
};

const jobService = {
  getJobs: async (keyword = '', location = 'all') => {
    try {
      const params = {};
      if (keyword) { params.search = keyword; params.keyword = keyword; }
      if (location !== 'all') params.location = location;

      const response = await api.get('/v1/jobs', { params });
      // Bắt mọi trường hợp dữ liệu trả về
      const rawJobs = response.data.data || response.data.jobs || response.data || [];

      if (!Array.isArray(rawJobs)) return [];
      return rawJobs.map(mapJobData);
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

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
  }
};

export default jobService;