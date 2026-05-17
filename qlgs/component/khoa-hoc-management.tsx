"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Section, Text } from "@/component/ui";
import { useAuthStore } from "@/store/auth.store";
import { 
  createCourse, 
  getCoursesByTutor, 
  updateCourse, 
  deleteCourse,
  getSubjects,
  getClassLevels,
  uploadCourseImage // NHỚ IMPORT HÀM NÀY NẾU BẠN BỎ VÀO CÙNG FILE SERVICE
} from "@/services/khoa-hoc.service";
import { giaSuService } from "@/services/gia-su.service";
import type { KhoaHoc, KhoaHocRequestDTO } from "@/types/khoa-hoc.type";
import type { SubjectOption, ClassLevelOption } from "@/types/search.type";

interface TietHocOption {
  idTietHoc: string;
  thu: string;
  gioBatDau?: string;
  gioKetThuc?: string;
  soTiet?: number;
}

interface FormData extends Omit<KhoaHocRequestDTO, 'danhSachIdTietHocRanh'> {
  danhSachIdTietHocRanh: string;
  anhMinhHoa: string; // Thêm trường ảnh vào FormData
}

export default function KhoaHocManagement() {
  const { idNguoiDung, loaiNguoiDungID } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState<string | null>(null);
  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelOption[]>([]);
  const [tietHocRanh, setTietHocRanh] = useState<TietHocOption[]>([]);
  const [selectedTietHoc, setSelectedTietHoc] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Trạng thái khi đang upload ảnh
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    tenKhoaHoc: '',
    moTa: '',
    yeuCau: '',
    noiDungKhoaHoc: '',
    soTienHoc: 0,
    soBuoiHoc: 0,
    idGiaSu: '',
    idMonHoc: '',
    idDanhMucLop: '',
    danhSachIdTietHocRanh: '',
    anhMinhHoa: '', // Khởi tạo trường ảnh
  });

  useEffect(() => {
    setIsMounted(true);
    useAuthStore.getState().loadFromStorage();
    if (typeof window !== 'undefined') {
      setIdGiaSu(localStorage.getItem('idGiaSu'));
    }
  }, []);

  useEffect(() => {
    if (isMounted && idGiaSu && loaiNguoiDungID === '2') {
      loadInitialData();
    }
  }, [isMounted, idGiaSu, loaiNguoiDungID]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!idGiaSu) {
        setError('Vui lòng đăng nhập lại để xem khóa học');
        return;
      }

      const [subjectsRes, classLevelsRes, coursesRes, lichRanhRes] = await Promise.all([
        getSubjects().catch(() => []),
        getClassLevels().catch(() => []),
        getCoursesByTutor(idGiaSu).catch(() => []),
        giaSuService.getLichRanh(idGiaSu).catch(() => [])
      ]);

      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);
      setClassLevels(Array.isArray(classLevelsRes) ? classLevelsRes : []);
      setCourses(Array.isArray(coursesRes) ? coursesRes : []);
      
      const lichRanhData = (lichRanhRes || []).map((lichDay: any) => ({
        idTietHoc: lichDay.tietHoc?.idTietHoc || '',
        thu: lichDay.tietHoc?.thu || '',
        gioBatDau: lichDay.tietHoc?.gioBatDau || '',
        gioKetThuc: lichDay.tietHoc?.gioKetThuc || '',
        soTiet: lichDay.tietHoc?.soTiet || 0,
      }));
      setTietHocRanh(lichRanhData);

    } catch (err: any) {
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'soTienHoc' || name === 'soBuoiHoc' ? Number(value) : value,
    }));
  };

  const handleTietHocChange = (idTietHoc: string) => {
    setSelectedTietHoc(prev => 
      prev.includes(idTietHoc) ? prev.filter(id => id !== idTietHoc) : [...prev, idTietHoc]
    );
  };

  // --- HÀM XỬ LÝ UPLOAD ẢNH ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const res = await uploadCourseImage(file);
      
      // Lưu URL do Backend trả về vào formData
      setFormData(prev => ({ ...prev, anhMinhHoa: res.fileUrl }));
      setSuccess('Tải ảnh lên thành công!');
      
      // Xóa thông báo success sau 3 giây cho đỡ rối mắt
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Không thể tải ảnh lên, vui lòng kiểm tra lại.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  // -----------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (selectedTietHoc.length === 0) {
      setError('Vui lòng chọn ít nhất một tiết học rảnh');
      return;
    }

    try {
      setLoading(true);
      const submitData: KhoaHocRequestDTO = {
        ...formData,
        idGiaSu: idGiaSu || '',
        danhSachIdTietHocRanh: selectedTietHoc,
        anhMinhHoa: formData.anhMinhHoa // Gửi link ảnh lên BE
      };

      if (editingId) {
        await updateCourse(editingId, submitData);
        setSuccess('Cập nhật khóa học thành công!');
      } else {
        await createCourse(submitData);
        setSuccess('Tạo khóa học thành công!');
      }

      resetForm();
      if (idGiaSu) {
        const coursesRes = await getCoursesByTutor(idGiaSu);
        setCourses(Array.isArray(coursesRes) ? coursesRes : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    try {
      setLoading(true);
      await deleteCourse(id);
      setSuccess('Xóa khóa học thành công!');
      setCourses(courses.filter(c => c.idKhoaHoc !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xóa khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: KhoaHoc) => {
    setFormData({
      tenKhoaHoc: course.tenKhoaHoc,
      moTa: course.moTa,
      yeuCau: course.yeuCau || '',
      noiDungKhoaHoc: course.noiDungKhoaHoc || '',
      soTienHoc: course.soTienHoc,
      soBuoiHoc: course.soBuoiHoc,
      anhMinhHoa: course.anhMinhHoa || '', // Nạp ảnh cũ vào form
      idGiaSu: '',
      idMonHoc: '',
      idDanhMucLop: '',
      danhSachIdTietHocRanh: '',
    });
    setSelectedTietHoc([]);
    setEditingId(course.idKhoaHoc);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      tenKhoaHoc: '', moTa: '', yeuCau: '', noiDungKhoaHoc: '',
      soTienHoc: 0, soBuoiHoc: 0, idGiaSu: '', idMonHoc: '', idDanhMucLop: '',
      danhSachIdTietHocRanh: '', anhMinhHoa: ''
    });
    setSelectedTietHoc([]);
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1: return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Đã duyệt</span>;
      case 2: return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Từ chối</span>;
      default: return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Chờ duyệt</span>;
    }
  };

  return (
    <main className="page-shell">
      <Section>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <Text as="h1" size="hero" className="mb-2">Quản Lý Khóa Học</Text>
              <Text size="lead" tone="muted">Tạo, chỉnh sửa và quản lý các khóa học của bạn</Text>
            </div>
            <div className="flex gap-2">
              <Link href="/#gia-su-features">
                <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800">← Quay Lại</Button>
              </Link>
              <Button 
                onClick={() => {
                  if(showForm) resetForm();
                  else setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!idGiaSu}
              >
                {showForm ? 'Hủy' : '+ Tạo Khóa Học'}
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMounted && <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"><Text className="text-blue-800">Đang tải...</Text></div>}
          {!idGiaSu && isMounted && <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><Text className="text-yellow-800">Vui lòng đăng nhập lại để xem khóa học</Text></div>}
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><Text className="text-red-800">{error}</Text></div>}
          {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"><Text className="text-green-800">{success}</Text></div>}

          {/* Form */}
          {showForm && (
            <Card className="bg-white p-8 mb-8">
              <Text as="h2" size="display" className="mb-6">{editingId ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}</Text>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- KHU VỰC UPLOAD ẢNH --- */}
                <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                  <label className="block text-sm font-bold text-gray-800 mb-3">Ảnh đại diện khóa học (Tùy chọn)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer transition-colors"
                    />
                    {uploading && <span className="text-sm font-medium text-blue-600 animate-pulse w-32">Đang tải lên...</span>}
                  </div>

                  {formData.anhMinhHoa && (
                    <div className="mt-4 relative w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group">
                      <img 
                        src={formData.anhMinhHoa} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, anhMinhHoa: '' }))}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Xóa ảnh"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                {/* --------------------------- */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên khóa học <span className="text-red-500">*</span></label>
                  <input type="text" name="tenKhoaHoc" value={formData.tenKhoaHoc} onChange={handleChange} placeholder="Ví dụ: Toán 12 Cơ Bản" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả khóa học <span className="text-red-500">*</span></label>
                  <textarea name="moTa" value={formData.moTa} onChange={handleChange} placeholder="Mô tả chi tiết về khóa học" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu đối với học viên</label>
                  <textarea name="yeuCau" value={formData.yeuCau} onChange={handleChange} placeholder="Các yêu cầu cần thiết" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung khóa học</label>
                  <textarea name="noiDungKhoaHoc" value={formData.noiDungKhoaHoc} onChange={handleChange} placeholder="Chi tiết nội dung sẽ học" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Môn học <span className="text-red-500">*</span></label>
                    <select name="idMonHoc" value={formData.idMonHoc} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required >
                      <option value="">Chọn môn học</option>
                      {subjects.map(subject => (<option key={subject.idMonHoc} value={subject.idMonHoc}>{subject.tenMonHoc}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cấp lớp <span className="text-red-500">*</span></label>
                    <select name="idDanhMucLop" value={formData.idDanhMucLop} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required >
                      <option value="">Chọn cấp lớp</option>
                      {classLevels.map(level => (<option key={level.idDanhMucLop} value={level.idDanhMucLop}>{level.tenLop}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá tiền (VNĐ) <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, soTienHoc: Math.max(0, prev.soTienHoc - 20000) }))} className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold">−</button>
                      <input type="number" name="soTienHoc" value={formData.soTienHoc} onChange={handleChange} placeholder="Nhập giá tiền" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" required min="0" step="20000" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, soTienHoc: prev.soTienHoc + 20000 }))} className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số buổi học <span className="text-red-500">*</span></label>
                    <input type="number" name="soBuoiHoc" value={formData.soBuoiHoc} onChange={handleChange} placeholder="Số buổi" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required min="1" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tiết học rảnh <span className="text-red-500">*</span></label>
                  {tietHocRanh.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><Text size="caption" className="text-yellow-800">Bạn chưa đăng ký tiết học rảnh nào. Vui lòng vào mục "Lịch rảnh" để đăng ký.</Text></div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {tietHocRanh.map(tiet => (
                        <label key={tiet.idTietHoc} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
                          <input type="checkbox" checked={selectedTietHoc.includes(tiet.idTietHoc)} onChange={() => handleTietHocChange(tiet.idTietHoc)} className="w-4 h-4 text-blue-600 rounded" />
                          <span className="ml-3 text-sm">
                            <div className="font-medium">{tiet.thu}</div>
                            {tiet.gioBatDau && tiet.gioKetThuc && <div className="text-gray-600 text-xs">{tiet.gioBatDau} - {tiet.gioKetThuc}</div>}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading || uploading || selectedTietHoc.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400">
                    {loading ? 'Đang xử lý...' : (editingId ? 'Cập Nhật' : 'Tạo Khóa Học')}
                  </Button>
                  <Button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-800">Hủy</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Courses List */}
          <div>
            <Text as="h2" size="display" className="mb-4">Danh Sách Khóa Học</Text>
            {loading && !showForm ? (
              <div className="text-center py-8"><Text size="body" tone="muted">Đang tải...</Text></div>
            ) : courses.length === 0 ? (
              <Card className="bg-white p-8 text-center"><Text size="body" tone="muted">Bạn chưa tạo khóa học nào</Text></Card>
            ) : (
              <div className="grid gap-4">
                {courses.map(course => (
                  <Card key={course.idKhoaHoc} className="bg-white p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      
                      {/* Thumbnail Khóa học */}
                      {course.anhMinhHoa && (
                        <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                          <img src={course.anhMinhHoa} alt={course.tenKhoaHoc} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex-1">
                        <Text as="h3" size="bodyStrong" className="mb-2">{course.tenKhoaHoc}</Text>
                        <div className="flex gap-4 mb-3 flex-wrap">
                          <Text size="caption" tone="muted"><span className="font-medium">Môn:</span> {course.tenMonHoc}</Text>
                          <Text size="caption" tone="muted"><span className="font-medium">Lớp:</span> {course.tenLop}</Text>
                          <Text size="caption" tone="muted"><span className="font-medium">Giá:</span> {course.soTienHoc.toLocaleString('vi-VN')} VNĐ</Text>
                        </div>
                        <Text size="caption" className="text-gray-600 line-clamp-2">{course.moTa}</Text>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {getStatusBadge(course.trangThai)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button onClick={() => handleEdit(course)} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700">Chỉnh Sửa</Button>
                      <Button onClick={() => handleDelete(course.idKhoaHoc)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700">Xóa</Button>
                      <Link href={`/gia-su/khoa-hoc/${course.idKhoaHoc}`} className="flex-1">
                        <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700">Chi Tiết</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </main>
  );
}