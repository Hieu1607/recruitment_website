import React, { useState, useEffect } from 'react';
import api from '../services/api'; 

const CompanyName = ({ id, initialName }) => {
  const [name, setName] = useState(initialName || 'Đang tải...');

  useEffect(() => {
    // 1. Ưu tiên dùng tên có sẵn (không gọi API)
    if (initialName && initialName !== "Công ty ẩn danh" && initialName !== "Đang tải...") {
        setName(initialName);
        return;
    }

    // 2. Nếu chỉ có ID, gọi API để lấy tên
    if (id) {
        const fetchName = async () => {
            try {
                // LƯU Ý QUAN TRỌNG: Phải có /v1 ở đây vì api.js chưa có
                const response = await api.get(`/v1/companies/${id}`);
                const data = response.data.data || response.data;
                
                // Lấy đúng trường name từ response
                setName(data.name || data.ten_cong_ty || `Công ty #${id}`);
            } catch (error) {
                // Nếu lỗi (404/500), hiện ID để giao diện không bị trống
                setName(`Công ty #${id}`); 
                // Tắt log lỗi để console sạch sẽ
            }
        };
        fetchName();
    } else if (!initialName) {
        setName("Công ty ẩn danh");
    }
  }, [id, initialName]);

  return <span className="company-name-label">{name}</span>;
};

export default CompanyName;