'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { giaSuService } from '@/services/gia-su.service';
import { CheckCircle2, Loader2, Trash2, Zap } from 'lucide-react';

interface TietHoc {
  idTietHoc: string;
  thu: string;
  gioBatDau: string;
  gioKetThuc: string;
  soTiet: number;
}

interface LichRanhItem {
  idLichDay: string;
  tietHoc: TietHoc;
  tinhTrang: boolean | number | string;
}

const BRAND = '#4A7766';
const BRAND_DARK = '#395c4f';
const BRAND_LIGHT = '#e8f0ed';

const DAY_PALETTE: Record<string, { dot: string; badge: string; text: string }> = {
  'Thứ 2':   { dot: 'bg-sky-400',    badge: 'bg-sky-50 text-sky-700 border-sky-200',    text: 'text-sky-600'    },
  'Thứ 3':   { dot: 'bg-violet-400', badge: 'bg-violet-50 text-violet-700 border-violet-200', text: 'text-violet-600' },
  'Thứ 4':   { dot: 'bg-pink-400',   badge: 'bg-pink-50 text-pink-700 border-pink-200',   text: 'text-pink-600'   },
  'Thứ 5':   { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  text: 'text-amber-600'  },
  'Thứ 6':   { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-600' },
  'Thứ 7':   { dot: 'bg-teal-400',   badge: 'bg-teal-50 text-teal-700 border-teal-200',   text: 'text-teal-600'   },
  'Chủ nhật':{ dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-700 border-rose-200',   text: 'text-rose-600'   },
};

export default function LichRanhTab() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState('');
  const [lichRanhList, setLichRanhList] = useState<LichRanhItem[]>([]);
  const [systemTietHoc, setSystemTietHoc] = useState<TietHoc[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const daysOfWeek = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roleId = localStorage.getItem('loaiNguoiDungID');
    const giaSuId = localStorage.getItem('idGiaSu');
    if (!token || roleId !== '2') { router.push('/login'); return; }
    setIsAuthenticated(true);
    if (giaSuId) { setIdGiaSu(giaSuId); loadLichRanh(giaSuId); loadSystemTietHoc(); }
  }, [router]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSystemTietHoc = async () => {
    try { setSystemTietHoc(await giaSuService.getAllTietHoc() || []); } catch {}
  };

  const loadLichRanh = async (id: string) => {
    setLoadingList(true);
    try { setLichRanhList(await giaSuService.getLichRanh(id) || []); }
    catch { setLichRanhList([]); }
    finally { setLoadingList(false); }
  };

  const fmt = (t: string) => !t ? '' : t.includes('T') ? t.split('T')[1].slice(0,5) : t.slice(0,5);

  const toggleSlot = (id: string) =>
    setSelectedSlots(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSubmit = async () => {
    if (!selectedSlots.length) return;
    setLoading(true);
    try {
      await giaSuService.registerLichRanh({ danhSachIdTietHoc: selectedSlots });
      showToast(`Đã mở ${selectedSlots.length} ca rảnh thành công!`, 'success');
      setSelectedSlots([]);
      if (idGiaSu) await loadLichRanh(idGiaSu);
    } catch (e: any) { showToast(e.message || 'Đăng ký thất bại!', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hủy ca rảnh này?')) return;
    try {
      await giaSuService.deleteLichRanh(id);
      if (idGiaSu) await loadLichRanh(idGiaSu);
    } catch (e: any) { showToast(e.message || 'Hủy thất bại!', 'error'); }
  };

  if (!isAuthenticated) return null;

  const availableList = lichRanhList.filter(l => l.tinhTrang === true || l.tinhTrang === 1 || String(l.tinhTrang) === 'true');
  const bookedList    = lichRanhList.filter(l => l.tinhTrang === false || l.tinhTrang === 0 || String(l.tinhTrang) === 'false');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 animate-in slide-in-from-top-2 duration-300
          ${toast.type === 'success' ? 'bg-[#4A7766] text-white' : 'bg-rose-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : '⚠'}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ══════════ CỘT TRÁI 2/3 ══════════ */}
        <div className="xl:col-span-2 space-y-5">

          {/* BẢNG CHỌN CA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header card */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BRAND_LIGHT }}>
                  <Zap size={20} style={{ color: BRAND }} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg leading-tight">Chọn khung giờ rảnh</p>
                  <p className="text-slate-400 text-xs mt-0.5">Nhấp vào ô trống → Lưu nhiều ca cùng lúc</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedSlots.length}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={selectedSlots.length ? { background: BRAND, color: '#fff', boxShadow: `0 4px 14px ${BRAND}55` } : { background: '#f1f5f9', color: '#94a3b8' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                {selectedSlots.length ? `Lưu ${selectedSlots.length} ca đã chọn` : 'Chưa chọn ca nào'}
              </button>
            </div>

            {/* Grid 7 cột */}
            <div className="p-6 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {daysOfWeek.map(day => {
                  const palette = DAY_PALETTE[day];
                  const slotsOfDay = systemTietHoc
                    .filter(t => t.thu === day)
                    .sort((a,b) => a.gioBatDau.localeCompare(b.gioBatDau));

                  return (
                    <div key={day} className="flex flex-col gap-2">
                      {/* Header thứ */}
                      <div className="flex flex-col items-center py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className={`w-2 h-2 rounded-full mb-1.5 ${palette.dot}`}/>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-none">
                          {day.replace('Thứ ', 'T')}
                        </span>
                      </div>

                      {/* Các ô slot */}
                      <div className="space-y-2">
                        {slotsOfDay.map(slot => {
                          const isOpen   = availableList.some(l => l.tietHoc?.idTietHoc === slot.idTietHoc);
                          const isBusy   = bookedList.some(l => l.tietHoc?.idTietHoc === slot.idTietHoc);
                          const isPicked = selectedSlots.includes(slot.idTietHoc);

                          if (isOpen) return (
                            <div key={slot.idTietHoc}
                              className="p-2.5 rounded-xl border text-center select-none cursor-default"
                              style={{ background: BRAND_LIGHT, borderColor: '#b2cfc7' }}
                            >
                              <p className="text-[12px] font-bold" style={{ color: BRAND }}>{fmt(slot.gioBatDau)}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: BRAND }}>✓ Mở</p>
                            </div>
                          );

                          if (isBusy) return (
                            <div key={slot.idTietHoc}
                              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-center select-none cursor-default"
                            >
                              <p className="text-[12px] font-bold text-rose-500">{fmt(slot.gioBatDau)}</p>
                              <p className="text-[10px] text-rose-400 mt-0.5">Bận</p>
                            </div>
                          );

                          return (
                            <div key={slot.idTietHoc}
                              onClick={() => toggleSlot(slot.idTietHoc)}
                              className="p-2.5 rounded-xl border text-center select-none cursor-pointer transition-all duration-150 active:scale-95"
                              style={isPicked
                                ? { background: BRAND, borderColor: BRAND, color: '#fff', boxShadow: `0 4px 12px ${BRAND}44`, transform: 'scale(1.04)' }
                                : { background: '#fff', borderColor: '#e2e8f0', color: '#64748b' }
                              }
                            >
                              <p className="text-[12px] font-bold">{fmt(slot.gioBatDau)}</p>
                              <p className="text-[10px] mt-0.5 opacity-70">{slot.soTiet} tiết</p>
                            </div>
                          );
                        })}

                        {slotsOfDay.length === 0 && (
                          <div className="p-3 rounded-xl border border-dashed border-slate-200 text-center">
                            <p className="text-[10px] text-slate-300">—</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="px-6 pb-5 flex items-center gap-6 flex-wrap text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: BRAND_LIGHT, border: `1px solid #b2cfc7` }}/>
                Đang mở
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200"/>
                Đã bận
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-slate-200 bg-white"/>
                Chưa mở
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: BRAND }}/>
                Đang chọn
              </div>
            </div>
          </div>

          {/* LỊCH ĐÃ BẬN */}
          {bookedList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"/>
                <p className="font-bold text-slate-800">Lịch đã bận</p>
                <span className="ml-auto text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-full font-semibold">
                  {bookedList.length} ca
                </span>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {bookedList
                  .sort((a,b) => daysOfWeek.indexOf(a.tietHoc?.thu) - daysOfWeek.indexOf(b.tietHoc?.thu))
                  .map(lich => {
                    const palette = DAY_PALETTE[lich.tietHoc?.thu] || DAY_PALETTE['Thứ 2'];
                    return (
                      <div key={lich.idLichDay}
                        className={`p-3.5 rounded-xl border ${palette.badge} flex flex-col gap-1`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-wider ${palette.text}`}>
                          {lich.tietHoc?.thu}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {fmt(lich.tietHoc?.gioBatDau)} – {fmt(lich.tietHoc?.gioKetThuc)}
                        </span>
                        <span className="text-[10px] text-rose-500 font-semibold">● Đang dạy</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ══════════ CỘT PHẢI 1/3 ══════════ */}
        <div className="xl:col-span-1 xl:sticky xl:top-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100"
              style={{ background: `linear-gradient(135deg, ${BRAND_LIGHT} 0%, #fff 100%)` }}>
              <div>
                <p className="font-bold text-slate-800">Khung giờ đang mở</p>
                <p className="text-xs text-slate-400 mt-0.5">Sẵn sàng nhận học viên</p>
              </div>
              <span className="text-sm font-black px-3 py-1.5 rounded-full"
                style={{ background: BRAND, color: '#fff' }}>
                {availableList.length} ca
              </span>
            </div>

            {/* List */}
            <div className="p-4 max-h-[520px] overflow-y-auto space-y-2">
              {loadingList ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin" size={24} style={{ color: BRAND }}/>
                </div>
              ) : availableList.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center" style={{ background: BRAND_LIGHT }}>
                    <CheckCircle2 size={28} style={{ color: BRAND }}/>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Chưa có khung giờ nào.</p>
                  <p className="text-slate-300 text-xs mt-1">Chọn ca ở bảng bên trái để bắt đầu.</p>
                </div>
              ) : (
                availableList
                  .sort((a,b) => daysOfWeek.indexOf(a.tietHoc?.thu) - daysOfWeek.indexOf(b.tietHoc?.thu) || (a.tietHoc?.gioBatDau||'').localeCompare(b.tietHoc?.gioBatDau||''))
                  .map(lich => {
                    const palette = DAY_PALETTE[lich.tietHoc?.thu] || DAY_PALETTE['Thứ 2'];
                    return (
                      <div key={lich.idLichDay}
                        className="group flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${palette.dot}`}/>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${palette.text}`}>
                              {lich.tietHoc?.thu}
                            </p>
                            <p className="font-bold text-slate-800 text-sm leading-tight">
                              {fmt(lich.tietHoc?.gioBatDau)} – {fmt(lich.tietHoc?.gioKetThuc)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(lich.idLichDay)}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-rose-400 transition-all"
                        >
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}