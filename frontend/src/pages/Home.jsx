import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header.jsx';

const Home = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user; 

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 70px)',
        backgroundColor: '#f0f2f5'
      }}>
        {isAuthenticated ? (
          <>
            <h1 style={{ color: '#00b14f' }}>Xin chào, {user.full_name}!</h1>
            <p>Chúc bạn tìm được công việc ưng ý trên Recruitment Demo.</p>
          </>
        ) : (
          <>
            <h1>Tìm việc làm nhanh 24h, việc làm mới nhất</h1>
            <p>Tiếp lợi thế, nối thành công. Hãy đăng nhập để tạo CV ngay!</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;