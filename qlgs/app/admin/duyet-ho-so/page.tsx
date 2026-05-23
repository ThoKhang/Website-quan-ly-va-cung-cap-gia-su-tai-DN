'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Search, GraduationCap, Loader2, Eye } from 'lucide-react';
import axiosClient from '@/services/axiosClient';

interface BangCapAdminDTO {
  idBangCap: string;
  tenBangCap: string;
  thongTinBangCap: string;
  ngayCap: string;
  anhMinhChung: string;
  trangThai: boolean | null;
  idGiaSu: string;
  tenGiaSu: string;
}

export default function AdminDuyetBangCapPage() {
  const [danhSach, setDanhSach] = useState<BangCapAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'cho' | 'da_duyet' | 'tu_choi'>('cho');
  const [anhXem, setAnhXem] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data: any = await axiosClient.get('/gia-su/admin/bang-cap');
      setDanhSach(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách bằng cấp:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDuyet = async (idBangCap: string, trangThai: boolean) => {
    const msg = trangThai ? "Duyệt bằng cấp này?" : "Từ chối bằng cấp này?";
    if (!confirm(msg)) return;
    try {
      await axiosClient.put(`/gia-su/admin/bang-cap/${idBangCap}/duyet?trangThai=${trangThai}`);
      alert(trangThai ? "Đã duyệt thành công!" : "Đã từ chối!");
      fetchData();
    } catch (error: any) {
      alert(error || "Không thể thực hiện thao tác");
    }
  };

    const filtered = danhSach.filter(bc => {
    const matchTab =
        activeTab === 'cho'      ? bc.trangThai === false :
        activeTab === 'da_duyet' ? bc.trangThai === true  : false;

    const matchSearch =
        bc.tenGiaSu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bc.tenBangCap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bc.idBangCap?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTab && matchSearch;
    });

  // Phân loại đúng: false = chờ duyệt, true = đã duyệt
  const soCho    = danhSach.filter(bc => bc.trangThai === false).length;
  const soDaDuyet = danhSach.filter(bc => bc.trangThai === true).length;

  const tabs = [
    { key: 'cho' as const,      label: 'Chờ duyệt',   count: soCho,     color: 'amber' },
    { key: 'da_duyet' as const, label: 'Đã duyệt',    count: soDaDuyet, color: 'green' },
  ];

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <GraduationCap className="text-[#4A7766]" /> Duyệt bằng cấp gia sư
            </h1>
            <p className="text-gray-400 text-sm mt-1">Xem xét và phê duyệt chứng chỉ, bằng cấp của gia sư</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm gia sư, tên bằng cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7766]/30 focus:border-[#4A7766]"
            />
          </div>
        </div>

        {/* Stat tabs */}
        <div className="grid grid-cols-2 gap-3">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const colorMap: Record<string, string> = {
              amber: isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400',
              green: isActive ? 'bg-[#4A7766] text-white border-[#4A7766]'  : 'bg-white text-[#4A7766] border-[#4A7766]/30 hover:border-[#4A7766]',
            };
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${colorMap[tab.color]}`}
              >
                <div className="text-2xl font-bold">{tab.count}</div>
                <div className="text-sm font-medium mt-1 opacity-90">{tab.label}</div>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-[#4A7766]">
            <Loader2 className="animate-spin mb-3" size={32} />
            <span className="text-gray-400 text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    <th className="py-3.5 px-4">Bằng cấp</th>
                    <th className="py-3.5 px-4">Gia sư</th>
                    <th className="py-3.5 px-4">Thông tin</th>
                    <th className="py-3.5 px-4 text-center">Ngày cấp</th>
                    <th className="py-3.5 px-4 text-center">Ảnh</th>
                    {activeTab === 'cho' && (
                      <th className="py-3.5 px-4 text-center">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {filtered.map((bc) => (
                    <tr key={bc.idBangCap} className="hover:bg-gray-50/60 transition-colors">

                      {/* Bằng cấp */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">{bc.tenBangCap}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{bc.idBangCap}</div>
                      </td>

                      {/* Gia sư */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-700">{bc.tenGiaSu}</div>
                        <div className="text-xs text-gray-400">{bc.idGiaSu}</div>
                      </td>

                      {/* Thông tin */}
                      <td className="py-3.5 px-4 text-gray-500 max-w-[200px]">
                        <p className="line-clamp-2 text-xs">{bc.thongTinBangCap}</p>
                      </td>

                      {/* Ngày cấp */}
                      <td className="py-3.5 px-4 text-center text-gray-500 text-xs">
                        {bc.ngayCap ? new Date(bc.ngayCap).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Ảnh minh chứng */}
                      <td className="py-3.5 px-4 text-center">
                        {bc.anhMinhChung ? (
                          <button
                            onClick={() => setAnhXem(bc.anhMinhChung)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Eye size={13} /> Xem ảnh
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">Không có</span>
                        )}
                      </td>

                      {/* Thao tác — chỉ hiện ở tab Chờ duyệt */}
                      {activeTab === 'cho' && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDuyet(bc.idBangCap, true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Check size={13} /> Duyệt
                            </button>
                            <button
                              onClick={() => handleDuyet(bc.idBangCap, false)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                            >
                              <X size={13} /> Từ chối
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={activeTab === 'cho' ? 6 : 5} className="py-16 text-center text-gray-400 text-sm">
                        <GraduationCap size={32} className="mx-auto mb-3 opacity-30" />
                        Không có bằng cấp nào trong mục này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal xem ảnh */}
      {anhXem && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setAnhXem(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setAnhXem(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ✕
            </button>
            <img
              src={anhXem}
              alt="Ảnh minh chứng"
              className="w-full rounded-xl shadow-2xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}