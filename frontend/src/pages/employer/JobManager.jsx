import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import { getMyCompany, getProfileByUserId } from '../../services/profileService';
import '../../css/manageJobs.css';

const JobManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State quản lý dữ liệu
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  /* ================= LOAD JOBS ================= */
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const company = await getMyCompany();
        if (!company) {
          alert('Vui lòng tạo hồ sơ công ty trước!');
          navigate('/employer/company-profile');
          return;
        }

        const res = await jobService.getMyCompanyJobs(company.id);
        setJobs(res.jobs || res || []);
      } catch (error) {
        console.error('Lỗi tải tin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [navigate]);

  /* ================= LOAD PROFILES ================= */
  const loadApplicantsWithName = async (apps) => {
    const result = await Promise.all(
      apps.map(async (app) => {
        try {
          const profile = await getProfileByUserId(app.user_id);
          return {
            ...app,
            full_name: profile.full_name || 'Ẩn danh',
          };
        } catch {
          return {
            ...app,
            full_name: 'Ẩn danh',
          };
        }
      })
    );

    setApplicants(result);
  };

  /* ================= VIEW APPLICANTS ================= */
  const handleViewApplicants = async (job) => {
    setLoading(true);
    try {
      const apps = await jobService.getJobApplicants(job.id);
      await loadApplicantsWithName(apps);
      setSelectedJob(job);
    } catch (error) {
      alert('Lỗi tải ứng viên');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const handleUpdateStatus = async (appId, newStatus) => {
    // Hiển thị tên trạng thái tiếng Việt trong confirm cho dễ hiểu
    const statusText = newStatus === 'offered' ? 'ĐÃ NHẬN (Offered)' : 'TỪ CHỐI (Rejected)';
    
    if (!window.confirm(`Xác nhận chuyển trạng thái thành: ${statusText}?`)) return;

    try {
      // Gọi API với đúng từ khóa: 'offered' hoặc 'rejected'
      await jobService.updateApplicationStatus(appId, newStatus);
      
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Lỗi API:', error);
      alert('Lỗi cập nhật trạng thái. Vui lòng kiểm tra lại!');
    }
  };

  // Helpers
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '---');

  // Cập nhật hàm này để khớp với API docs: offered, interview_scheduled, rejected...
  const renderStatus = (st) => {
    switch (st) {
      case 'offered': // Thay vì accepted
        return <span className="status-badge status-accepted">Đã nhận (Offered)</span>;
      case 'rejected':
        return <span className="status-badge status-rejected">Từ chối</span>;
      case 'interview_scheduled':
        return <span className="status-badge status-warning">Phỏng vấn</span>;
      case 'under_review':
        return <span className="status-badge" style={{backgroundColor: '#3498db', color: 'white'}}>Đang xem xét</span>;
      default:
        return <span className="status-badge status-pending">Chờ duyệt</span>;
    }
  };

  if (loading && !selectedJob)
    return (
      <div className="manage-container" style={{ textAlign: 'center' }}>
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="manage-container">
      {selectedJob ? (
        /* ================= VIEW APPLICANTS TABLE ================= */
        <div>
          <button className="btn-back" onClick={() => setSelectedJob(null)}>
            ← Quay lại
          </button>

          <div className="manage-header">
            <h2 className="manage-title">
              Ứng viên cho: {selectedJob.title}
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tên ứng viên</th>
                  <th>CV</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length > 0 ? (
                  applicants.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 'bold' }}>
                        {app.full_name}
                      </td>
                      <td>
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#00b14f' }}
                        >
                          Xem CV
                        </a>
                      </td>
                      <td>{formatDate(app.created_at)}</td>
                      <td>{renderStatus(app.status)}</td>
                      <td>
                        {/* Nút Chấp nhận -> gửi 'offered' */}
                        {app.status !== 'offered' && app.status !== 'rejected' && (
                          <button
                            className="action-btn btn-approve"
                            title="Chấp nhận (Offered)"
                            onClick={() =>
                              handleUpdateStatus(app.id, 'offered')
                            }
                          >
                            ✓
                          </button>
                        )}
                        
                        {/* Nút Từ chối -> gửi 'rejected' */}
                        {app.status !== 'rejected' && app.status !== 'offered' && (
                          <button
                            className="action-btn btn-reject"
                            title="Từ chối (Rejected)"
                            onClick={() =>
                              handleUpdateStatus(app.id, 'rejected')
                            }
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Chưa có ứng viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= JOB LIST TABLE ================= */
        <div>
          <div className="manage-header">
            <h2 className="manage-title">Quản lý tin tuyển dụng</h2>
            <Link to="/employer/post-job" className="btn-create">
              + Đăng tin mới
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Mức lương</th>
                  <th>Hạn nộp</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 600 }}>{job.title}</td>
                      <td>{job.salary}</td>
                      <td>{formatDate(job.deadline)}</td>
                      <td>
                        {new Date(job.deadline) < new Date() ? (
                          <span className="status-badge status-rejected">
                            Hết hạn
                          </span>
                        ) : (
                          <span className="status-badge status-accepted">
                            Đang tuyển
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="action-btn btn-view"
                          onClick={() => handleViewApplicants(job)}
                        >
                          👥 Xem hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Bạn chưa có tin nào.
                      <Link
                        to="/employer/post-job"
                        style={{ marginLeft: 5, color: '#00b14f' }}
                      >
                        Đăng ngay
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;