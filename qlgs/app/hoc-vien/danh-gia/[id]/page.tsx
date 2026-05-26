"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { hocVienService } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import {
  Home, ChevronRight, Loader2, Star, CheckCircle2,
  AlertCircle, MessageSquare, BookOpen, GraduationCap, Send, Lock
} from "lucide-react";

export default function DanhGiaPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuthStore();
  const idDangKy = params.id as string;

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [existing, setExisting]     = useState<any>(null); // đánh giá cũ nếu có
  const [soSao, setSoSao]           = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [noiDung, setNoiDung]       = useState("");
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  // Trạng thái chỉ xem khi khóa học đã có đánh giá
  const isReadOnly = !!existing;

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    fetchData();
  }, [isLoggedIn, idDangKy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin đăng ký
      const detail = await hocVienService.getCourseDetailById(idDangKy);
      setBookingInfo(detail);

      // Kiểm tra đã đánh giá chưa
      try {
        const existingRating = await hocVienService.getRating(idDangKy);
        if (existingRating) {
          setExisting(existingRating);
          setSoSao(existingRating.soSao);
          setNoiDung(existingRating.noiDung || "");
        }
      } catch {
        // Chưa đánh giá — bình thường
      }
    } catch (err: any) {
      setError("Không thể tải thông tin khóa học.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return; // Chặn bấm nếu ở chế độ chỉ đọc

    if (!noiDung.trim()) {
      setError("Vui lòng nhập nội dung nhận xét.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Tạo đánh giá mới (Bỏ phần cập nhật cũ theo yêu cầu khóa tính năng sửa)
      await hocVienService.rateCourse({
        idDangKy,
        soSao,
        noiDung: noiDung.trim(),
      });
      
      setSuccess("Cảm ơn bạn đã đánh giá!");
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (e: any) {
      setError(e?.message || e?.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tốt"];

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-sm text-slate-500">Đang tải…</p>
      </div>
    </div>
  );

  const khoaHoc = bookingInfo?.khoaHoc;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ HERO BANNER ══ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-4 flex-wrap gap-y-1">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home size={14} /> Trang chủ
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/hoc-vien/lich-su" className="hover:text-white transition-colors">
              Lịch sử đăng ký
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-semibold">
              {isReadOnly ? "Chi tiết đánh giá" : "Đánh giá khóa học"}
            </span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            {isReadOnly ? "Thông tin đánh giá của bạn" : "Đánh giá khóa học"}
          </h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl">
            {isReadOnly 
              ? "Bạn đã thực hiện đánh giá cho khóa học này. Hệ thống đã ghi nhận thành công."
              : "Chia sẻ trải nghiệm của bạn để giúp các phụ huynh khác tìm được gia sư phù hợp."
            }
          </p>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-5">

        {/* Thông tin khóa học */}
        {khoaHoc && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={15} className="text-blue-500" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Khóa học</h2>
            </div>
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 bg-blue-50 flex items-center justify-center">
                {khoaHoc.anhMinhHoa
                  ? <img src={khoaHoc.anhMinhHoa} alt="" className="w-full h-full object-cover" />
                  : <BookOpen size={20} className="text-blue-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">{khoaHoc.tenKhoaHoc}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={11} /> {khoaHoc.tenGiaSu}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>{khoaHoc.tenMonHoc}</span>
                  <span className="text-slate-300">·</span>
                  <span>{khoaHoc.tenLop}</span>
                  <span className="text-slate-300">·</span>
                  <span>{khoaHoc.soBuoiHoc} buổi</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form đánh giá */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="p-6 space-y-6">

            {/* Thông báo */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle size={14} className="flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 size={14} className="flex-shrink-0" /> {success}
              </div>
            )}

            {/* Chọn số sao */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star size={15} className="text-amber-500" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {isReadOnly ? "Mức độ hài lòng đã chọn" : "Đánh giá chất lượng"}
                </h2>
              </div>

              <div className="flex flex-col items-center gap-3 py-4">
                {/* Sao */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= (hoveredStar || soSao);
                    return (
                      <button
                        key={star}
                        disabled={isReadOnly}
                        onClick={() => !isReadOnly && setSoSao(star)}
                        onMouseEnter={() => !isReadOnly && setHoveredStar(star)}
                        onMouseLeave={() => !isReadOnly && setHoveredStar(0)}
                        className={`transition-transform ${!isReadOnly ? "hover:scale-110 active:scale-95 cursor-pointer" : "cursor-default opacity-85"}`}
                      >
                        <Star
                          size={40}
                          className="transition-colors duration-100"
                          style={{
                            fill: filled ? "#FBBF24" : "transparent",
                            color: filled ? "#FBBF24" : "#D1D5DB",
                            strokeWidth: 1.5,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Label */}
                <div className="h-6 flex items-center">
                  {(hoveredStar || soSao) > 0 && (
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: "#FAEEDA",
                        color: "#854F0B",
                      }}
                    >
                      {starLabels[hoveredStar || soSao]}
                    </span>
                  )}
                </div>

                {/* Thanh sao mini */}
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className="h-1 w-8 rounded-full transition-all"
                      style={{
                        background: s <= soSao ? "#FBBF24" : "#E5E7EB",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Nhận xét */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={15} className="text-indigo-500" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {isReadOnly ? "Nội dung nhận xét của bạn" : "Nhận xét chi tiết"}
                </h2>
              </div>

              <textarea
                value={noiDung}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                onChange={(e) => { if (!isReadOnly) { setNoiDung(e.target.value); setError(""); } }}
                placeholder="Chia sẻ trải nghiệm của bạn về gia sư và khóa học — cách giảng dạy, thái độ, hiệu quả học tập..."
                rows={5}
                className={`w-full px-4 py-3 border rounded-xl text-sm transition-all resize-none leading-relaxed ${
                  isReadOnly 
                    ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none" 
                    : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white focus:border-transparent"
                }`}
              />
              <div className="flex justify-between mt-1.5">
                {!isReadOnly && noiDung.trim() === "" && !error && (
                  <p className="text-xs text-slate-400">Tối thiểu vài chữ để giúp phụ huynh khác tham khảo.</p>
                )}
                {isReadOnly && existing?.ngayDanhGia && (
                  <p className="text-xs text-slate-400">Được gửi vào: {new Date(existing.ngayDanhGia).toLocaleDateString('vi-VN')}</p>
                )}
                <span className="text-xs text-slate-400 ml-auto">{noiDung.length} ký tự</span>
              </div>
            </div>

            {/* Gợi ý nội dung - CHỈ HIỂN THỊ KHI CHƯA ĐÁNH GIÁ */}
            {!isReadOnly && noiDung.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {[
                  "Gia sư nhiệt tình, dễ hiểu",
                  "Con tiến bộ rõ rệt",
                  "Lịch học linh hoạt",
                  "Phương pháp giảng dạy tốt",
                  "Kiên nhẫn với học sinh",
                ].map((goi) => (
                  <button
                    key={goi}
                    onClick={() => setNoiDung(goi)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all"
                  >
                    + {goi}
                  </button>
                ))}
              </div>
            )}

            {/* Nút Submit - LÀM MỜ, ĐỔI MÀU VÀ KHÓA CLICK KHI ĐÃ ĐÁNH GIÁ */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !!success || isReadOnly}
              className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                isReadOnly ? "opacity-50 cursor-not-allowed shadow-none" : "hover:opacity-95"
              }`}
              style={{ background: isReadOnly ? "#94A3B8" : "#BA7517" }}
              onMouseOver={(e) => !submitting && !success && !isReadOnly && (e.currentTarget.style.background = "#854F0B")}
              onMouseOut={(e) => (e.currentTarget.style.background = isReadOnly ? "#94A3B8" : "#BA7517")}
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Đang gửi…</>
              ) : success ? (
                <><CheckCircle2 size={16} /> Đã gửi!</>
              ) : isReadOnly ? (
                <><Lock size={16} /> Bạn đã đánh giá khóa học này</>
              ) : (
                <><Send size={16} /> Gửi đánh giá</>
              )}
            </button>

            {/* Quay lại */}
            <div className="text-center">
              <Link
                href="/hoc-vien/lich-su"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {isReadOnly ? "Quay lại lịch sử đăng ký" : "Bỏ qua, quay lại lịch sử đăng ký"}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}