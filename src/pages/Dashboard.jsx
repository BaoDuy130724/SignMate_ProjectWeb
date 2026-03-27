import React from 'react';
import { 
  Users, 
  Video, 
  FileCheck, 
  Settings, 
  Activity, 
  Database,
  Grid,
  ClipboardList,
  BarChart
} from 'lucide-react';

const Dashboard = ({ role }) => {
  const getDashboardContent = () => {
    switch (role) {
      case 'Admin':
        return [
          { title: 'Tài khoản người dùng', desc: '145 người dùng hiện tại', icon: <Users size={28} className="text-blue" />, color: 'bg-blue-light' },
          { title: 'Dung lượng hệ thống', desc: 'Sử dụng 65% tài nguyên', icon: <Activity size={28} className="text-green" />, color: 'bg-green-light' },
          { title: 'Lịch sử hoạt động', desc: '20 lỗi hệ thống vừa log', icon: <Database size={28} className="text-yellow" />, color: 'bg-yellow-light' },
          { title: 'Cấu hình hệ thống', desc: 'Chưa cập nhật từ tháng 3', icon: <Settings size={28} className="text-blue" />, color: 'bg-blue-light' },
        ];
      case 'Lecturer':
        return [
          { title: 'Lớp học của tôi', desc: '4 lớp đang hoạt động', icon: <Grid size={28} className="text-green" />, color: 'bg-green-light' },
          { title: 'Bài giảng mới', desc: '2 bài chờ được duyệt', icon: <Video size={28} className="text-blue" />, color: 'bg-blue-light' },
          { title: 'Bài tập Sinh viên', desc: '12 bài cần chấm điểm', icon: <ClipboardList size={28} className="text-yellow" />, color: 'bg-yellow-light' },
          { title: 'Số lượng Sinh viên', desc: '148 sinh viên đang theo học', icon: <Users size={28} className="text-green" />, color: 'bg-green-light' },
        ];
      case 'Principal':
        return [
          { title: 'Báo cáo Toàn cục', desc: 'Sự tiến bộ bình quân: 85%', icon: <BarChart size={28} className="text-blue" />, color: 'bg-blue-light' },
          { title: 'Hiệu suất Giảng dạy', desc: '32 giảng viên tích cực nhất', icon: <Activity size={28} className="text-green" />, color: 'bg-green-light' },
          { title: 'Chất lượng Đào tạo', desc: 'Xếp hạng chất lượng: Xuất sắc', icon: <FileCheck size={28} className="text-yellow" />, color: 'bg-yellow-light' },
          { title: 'Nhân sự toàn trường', desc: '82 nhân viên đang công tác', icon: <Users size={28} className="text-blue" />, color: 'bg-blue-light' },
        ];
      default:
        return [
          { title: 'Welcome to SignMate', desc: 'Hãy chọn một chức năng ở thanh Sidebar!', icon: <Grid size={28} className="text-blue" />, color: 'bg-blue-light' },
        ];
    }
  };

  const dashboardItems = getDashboardContent();

  return (
    <div>
      <h1 className="text-green" style={{ fontSize: '32px', marginBottom: '8px' }}>Xin chào {role}!</h1>
      <p style={{ color: '#777', fontSize: '18px', marginBottom: '32px' }}>
        Chào mừng bạn quay lại hệ thống quản lý SignMate. Dưới đây là tóm tắt nhanh:
      </p>

      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <div key={index} className="card-duo">
            <div className={`card-icon ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '48px' }}>
        <button className="btn-duo">Xem báo cáo chi tiết</button>
        <button className="btn-duo btn-duo-blue" style={{ marginLeft: '12px' }}>Xuất bản báo cáo</button>
      </div>
    </div>
  );
};

export default Dashboard;
