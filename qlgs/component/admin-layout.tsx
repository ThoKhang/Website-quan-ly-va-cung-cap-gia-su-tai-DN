import AdminSidebar from './admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        {children}
      </main>
    </div>
  );
}