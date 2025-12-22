import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { logout, user } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Trang chủ (Dashboard)</h1>
      <p>Xin chào, {user?.email || 'User'}!</p>
      <button onClick={logout} style={{ padding: '10px', background: 'red', color: 'white' }}>
        Đăng xuất
      </button>
    </div>
  );
};

export default Home;