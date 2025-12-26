import React, { useState, useEffect } from 'react';
import api from '../services/api'; 

// Nhận cả id và tên ban đầu (initialName)
const CompanyName = ({ id, initialName }) => {
  // Nếu có tên sẵn thì dùng luôn, không thì hiện "Đang tải..."
  const [name, setName] = useState(initialName || 'Đang tải...');

  useEffect(() => {
    // Nếu đã có tên từ API list rồi thì KHÔNG gọi API chi tiết nữa
    if (initialName && initialName !== "Công ty ẩn danh") {
        setName(initialName);
        return;
    }

    // Nếu không có tên mà có ID thì mới đi gọi API
    if (id) {
        const fetchName = async () => {
            try {
                const response = await api.get(`/v1/companies/${id}`);
                const data = response.data.data || response.data;
                setName(data.name || data.ten_cong_ty || `Công ty #${id}`);
            } catch (error) {
                setName(`Công ty #${id}`);
            }
        };
        fetchName();
    } else if (!initialName) {
        setName("Công ty ẩn danh");
    }
  }, [id, initialName]);

  return <span>{name}</span>;
};

export default CompanyName;