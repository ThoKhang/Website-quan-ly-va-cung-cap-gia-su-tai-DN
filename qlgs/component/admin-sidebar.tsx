'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, BookOpen, UserCheck, GraduationCap, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tài khoản nhân viên', icon: Briefcase, path: '/dashboard/nhan-vien' },
    { name: 'Tài khoản người dùng', icon: Users, path: '/dashboard/nguoi-dung' },
    { name: 'Quản lý khóa học', icon: BookOpen, path: '/dashboard/khoa-hoc' },
    { name: 'Duyệt hồ sơ gia sư', icon: UserCheck, path: '/dashboard/duyet-ho-so' },
    { name: 'Duyệt bằng cấp', icon: GraduationCap, path: '/dashboard/duyet-bang-cap' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm h-screen">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-xl font-bold text-[#4A7766]">Admin Portal</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#4A7766] text-white shadow-md' : 'text-gray-600 hover:bg-[#ECE7E2] hover:text-[#4A7766]'}`}>
              <Icon size={18} /> {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}