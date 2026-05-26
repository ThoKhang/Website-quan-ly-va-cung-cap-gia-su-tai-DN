"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hocVienService, type HocVienListItem, type ChiTietLichHocResponse, type DangKyHocResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import {
  Clock, BookOpen, ChevronLeft, ChevronRight, 
  Home, Loader2, Users, CalendarDays, AlertCircle, 
  UserCircle2, PlayCircle, MoreHorizontal, CalendarX, PlusCircle
} from "lucide-react";

// Lấy danh sách các ngày trong tuần
const getDaysInWeek = (offset = 0) => {
  const days = [];
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1 + offset * 7)); 
  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDay);
    day.setDate(firstDay.getDate() + i);
    days.push(day);
  }
  return days;
};

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

export default function TimetablePage() {
  const router = useRouter();
  const { isLoggedIn, idNguoiDung } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<HocVienListItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [scheduleData, setScheduleData] = useState<ChiTietLichHocResponse[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  
  // State lưu ngày đang được chọn xem (Mặc định là hôm nay)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toLocaleDateString("en-CA"));

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    fetchStudents();
  }, [isLoggedIn]);

  const fetchStudents = async () => {
    try {
      const data = await hocVienService.getHocVienList();
      setStudents(data);
      if (data.length > 0) {
        setSelectedStudentId(data[0].idHocVien);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách học viên:", err);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentSchedule();
    }
  }, [selectedStudentId]);

  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);
      const history: DangKyHocResponse[] = await hocVienService.getBookingHistory(idNguoiDung || "");
      
      const studentSchedules = history
        .filter(b => (b as any).idHocVien === selectedStudentId || true) 
        .flatMap(b => b.chiTietLichHoc.map(session => ({
          ...session,
          courseName: b.khoaHoc.tenKhoaHoc,
          tutorName: b.khoaHoc.tenGiaSu,
          monHoc: b.khoaHoc.tenMonHoc
        })));

      setScheduleData(studentSchedules as any);
    } catch (err) {
      console.error("Lỗi lấy lịch học:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật lại list ngày khi đổi tuần
  const currentWeekDays = useMemo(() => getDaysInWeek(weekOffset), [weekOffset]);

  // Khi đổi tuần, tự động chuyển tab về ngày Thứ 2 của tuần đó
  useEffect(() => {
    setSelectedDateStr(currentWeekDays[0].toLocaleDateString("en-CA"));
  }, [weekOffset]);

  const categorizedSchedule = useMemo(() => {
    const result: Record<string, any[]> = {};
    currentWeekDays.forEach((day) => {
      const dayStr = day.toLocaleDateString("en-CA");
      result[dayStr] = scheduleData.filter(session => {
        return new Date(session.ngayHoc).toLocaleDateString("en-CA") === dayStr;
      }).sort((a, b) => a.ngayHoc.localeCompare(b.ngayHoc));
    });
    return result;
  }, [scheduleData, currentWeekDays]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const hasAnyClasses = scheduleData.length > 0;
  const selectedDaySessions = categorizedSchedule[selectedDateStr] || [];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 relative">
      
      {/* ══════════════════════════════════
          HERO BANNER
      ══════════════════════════════════ */}
      <div className="bg-slate-900 pt-6 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex items-center text-xs font-medium text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home size={12} /> Trang chủ</Link>
            <ChevronRight size={12} className="mx-2" />
            <span className="text-white font-bold">Thời khóa biểu</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                <CalendarDays className="text-blue-500" size={32} /> Thời khóa biểu
              </h1>
              <p className="text-slate-400 text-sm mt-2">Theo dõi lộ trình và lịch học trực tuyến của các con.</p>
            </div>

            {/* Điều hướng tuần */}
            {hasAnyClasses && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
                <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div className="px-5 text-center min-w-[180px]">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Tuần {weekOffset === 0 ? "này" : weekOffset > 0 ? "tới" : "trước"}</p>
                  <p className="text-xs font-bold text-white">
                    {currentWeekDays[0].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} - {currentWeekDays[6].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ══════════════════════════════════
              SIDEBAR: CHỌN HỌC VIÊN
          ══════════════════════════════════ */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Users size={18} className="text-blue-600" /> Hồ sơ con em
              </h2>
              
              <div className="space-y-3">
                {students.map((student) => (
                  <button
                    key={student.idHocVien}
                    onClick={() => setSelectedStudentId(student.idHocVien)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      selectedStudentId === student.idHocVien
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-transparent bg-slate-50 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm shrink-0 ${
                      selectedStudentId === student.idHocVien ? "bg-blue-600 text-white" : "bg-white text-slate-400 border border-slate-200"
                    }`}>
                      {student.tenHocVien.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className={`text-sm font-bold truncate ${selectedStudentId === student.idHocVien ? "text-blue-900" : "text-slate-700"}`}>
                        {student.tenHocVien}
                      </p>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider mt-0.5">ID: {student.idHocVien}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Link href="/hoc-vien/ho-so" className="block mt-4">
                <button className="w-full py-3.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <PlusCircle size={16}/> Thêm học viên mới
                </button>
              </Link>
            </div>

            {/* Chú thích màu sắc (Chỉ hiện khi có lịch) */}
            {hasAnyClasses && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hidden lg:block">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trạng thái buổi học</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" /> Sắp diễn ra
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Đã hoàn thành
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" /> Học viên xin nghỉ
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════
              MAIN: THỜI KHÓA BIỂU DẠNG CALENDAR
          ══════════════════════════════════ */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="bg-white rounded-[2rem] p-24 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Đang tải lịch học…</p>
              </div>
            ) : !hasAnyClasses ? (
              /* TRẠNG THÁI CHƯA CÓ KHÓA HỌC */
              <div className="bg-white rounded-[2rem] p-12 md:p-20 text-center border border-slate-100 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarX className="text-slate-300" size={48} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3">Học viên chưa có khóa học nào</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Hiện tại học viên này chưa đăng ký tham gia khóa học nào. Hãy tìm kiếm gia sư và đăng ký lớp để bắt đầu lộ trình học tập nhé!
                </p>
                <Link href="/search">
                  <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1">
                    Khám phá khóa học ngay
                  </button>
                </Link>
              </div>
            ) : (
              /* TRẠNG THÁI CÓ LỊCH HỌC -> DẠNG TABS */
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                
                {/* THANH CHỌN NGÀY NGANG (TABS) */}
                <div className="flex overflow-x-auto hide-scrollbar bg-slate-50 border-b border-slate-100 p-2 gap-2">
                  {currentWeekDays.map((day, idx) => {
                    const dayStr = day.toLocaleDateString("en-CA");
                    const isSelected = selectedDateStr === dayStr;
                    const isToday = new Date().toLocaleDateString("en-CA") === dayStr;
                    const hasClass = (categorizedSchedule[dayStr] || []).length > 0;

                    return (
                      <button
                        key={dayStr}
                        onClick={() => setSelectedDateStr(dayStr)}
                        className={`flex-1 min-w-[80px] py-3 px-2 flex flex-col items-center justify-center rounded-2xl transition-all relative ${
                          isSelected 
                            ? "bg-white shadow-sm border border-slate-200" 
                            : "hover:bg-slate-100/80 border border-transparent"
                        }`}
                      >
                        <p className={`text-[10px] font-black uppercase mb-1 ${isSelected ? "text-blue-600" : isToday ? "text-slate-800" : "text-slate-400"}`}>
                          {DAY_NAMES[idx].replace("Thứ ", "T")}
                        </p>
                        <p className={`text-xl font-black ${isSelected ? "text-slate-900" : isToday ? "text-slate-800" : "text-slate-400"}`}>
                          {day.getDate()}
                        </p>
                        
                        {/* Chấm tròn báo hiệu có môn học */}
                        {hasClass && (
                          <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-slate-300"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* DANH SÁCH MÔN HỌC CỦA NGÀY ĐƯỢC CHỌN */}
                <div className="p-6 md:p-8 bg-white min-h-[400px]">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <CalendarDays className="text-blue-500" size={20}/> 
                      Lịch học ngày {new Date(selectedDateStr).toLocaleDateString("vi-VN")}
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">
                      {selectedDaySessions.length} tiết học
                    </span>
                  </div>

                  {selectedDaySessions.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDaySessions.map((session) => (
                        <div 
                          key={session.idLichHoc} 
                          className={`group relative overflow-hidden rounded-2xl border transition-all hover:shadow-md bg-white ${
                            session.tinhTrang === "Đã hoàn thành" ? "border-emerald-200" : 
                            session.tinhTrang === "Học viên nghỉ" ? "border-rose-200" : "border-blue-200"
                          }`}
                        >
                          {/* Dải màu đánh dấu trạng thái */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                            session.tinhTrang === "Đã hoàn thành" ? "bg-emerald-500" : 
                            session.tinhTrang === "Học viên nghỉ" ? "bg-rose-500" : "bg-blue-500"
                          }`} />

                          <div className="p-5 pl-6 flex flex-col md:flex-row md:items-center gap-5">
                            
                            {/* Khối Giờ học */}
                            <div className="flex items-center md:flex-col md:items-start gap-3 md:gap-1 min-w-[100px]">
                              <div className="flex items-center gap-1.5 text-slate-800">
                                <Clock size={16} className={
                                  session.tinhTrang === "Đã hoàn thành" ? "text-emerald-500" : 
                                  session.tinhTrang === "Học viên nghỉ" ? "text-rose-500" : "text-blue-500"
                                } />
                                <span className="text-lg font-black">{formatTime(session.ngayHoc)}</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded ${
                                session.tinhTrang === "Đã hoàn thành" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
                                session.tinhTrang === "Học viên nghỉ" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-blue-50 text-blue-600 border-blue-200"
                              }`}>
                                {session.tinhTrang}
                              </span>
                            </div>

                            {/* Vạch kẻ chia cắt trên Desktop */}
                            <div className="hidden md:block w-px h-12 bg-slate-100" />

                            {/* Thông tin Môn học */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                  {session.monHoc}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">#{session.idLichHoc}</span>
                              </div>
                              <h4 className="text-base font-black text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                                {session.courseName}
                              </h4>
                              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                  <UserCircle2 size={14} className="text-slate-400" /> Gia sư: <strong className="text-slate-800">{session.tutorName}</strong>
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                  <PlayCircle size={14} className="text-slate-400" /> <strong className="text-slate-800">Online</strong>
                                </span>
                              </div>
                            </div>

                            {/* Menu Hành động */}
                            <div className="pt-3 border-t md:border-t-0 md:pt-0 border-slate-100 flex justify-end">
                              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                <MoreHorizontal size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <AlertCircle className="text-slate-300" size={32} />
                      </div>
                      <h4 className="text-slate-700 font-black mb-1">Trống lịch học</h4>
                      <p className="text-sm text-slate-500">Học viên không có ca học nào trong ngày này.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}