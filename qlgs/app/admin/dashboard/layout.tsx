// app/dashboard/layout.tsx
import AdminLayout from '@/component/admin-layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}