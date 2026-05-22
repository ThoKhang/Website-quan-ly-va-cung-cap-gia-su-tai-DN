"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Text } from "@/component/ui";
import { hocVienService, type PhuHuynhProfile, type HocVienListItem, type QuanHuyenDTO, type PhuongXaDTO } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import ChangePasswordModal from "@/component/change-password-modal";

interface PhuHuynhFormData {
  tenPhuHuynh: string;
  gioiTinh: boolean;
  ngaySinh: string;
  sdt: string;
  cccd: string;
  soNhaTenDuong: string;
  maPhuongXa?: string;
}

interface HocVienFormData {
  tenHocVien: string;
  gioiTinh: boolean;
  cccd: string;
  ngaySinh: string;
}

export default function HocVienProfilePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"phu-huynh" | "hoc-vien">("phu-huynh");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Danh sách Quận/Huyện và Phường/Xã
  const [quanHuyenList, setQuanHuyenList] = useState<QuanHuyenDTO[]>([]);
  const [phuongXaList, setPhuongXaList] = useState<PhuongXaDTO[]>([]);

  // Phụ huynh form
  const [phuHuynhForm, setPhuHuynhForm] = useState<PhuHuynhFormData>({
    tenPhuHuynh: "",
    gioiTinh: true,
    ngaySinh: "",
    sdt: "",
    cccd: "",
    soNhaTenDuong: "",
    maPhuongXa: "",
  });

  // Học viên form
  const [hocVienForm, setHocVienForm] = useState<HocVienFormData>({
    tenHocVien: "",
    gioiTinh: true,
    cccd: "",
    ngaySinh: "",
  });

  // Danh sách học viên
  const [hocVienList, setHocVienList] = useState<HocVienListItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchData();
    fetchQuanHuyen();
  }, [isLoggedIn, router]);

  const fetchQuanHuyen = async () => {
    try {
      const data = await hocVienService.getQuanHuyenList();
      setQuanHuyenList(data);
    } catch (err: any) {
      console.error("Lỗi tải danh sách Quận/Huyện:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const phuHuynhData = await hocVienService.getPhuHuynhInfo();
      
      // Nếu có Phường/Xã, tải danh sách Phường/Xã của Quận/Huyện đó
      if (phuHuynhData.phuongXa?.maPhuongXa && phuHuynhData.phuongXa?.quanHuyen?.idQuanHuyen) {
        const quanHuyenId = phuHuynhData.phuongXa.quanHuyen.idQuanHuyen;
        const phuongXaData = await hocVienService.getPhuongXaList(quanHuyenId);
        setPhuongXaList(phuongXaData);
      }
      
      setPhuHuynhForm({
        tenPhuHuynh: phuHuynhData.tenPhuHuynh || "",
        gioiTinh: phuHuynhData.gioiTinh !== undefined ? phuHuynhData.gioiTinh : true,
        ngaySinh: phuHuynhData.ngaySinh ? phuHuynhData.ngaySinh.split('T')[0] : "",
        sdt: phuHuynhData.sdt || "",
        cccd: phuHuynhData.cccd || "",
        soNhaTenDuong: phuHuynhData.soNhaTenDuong || "",
        maPhuongXa: phuHuynhData.phuongXa?.maPhuongXa || "",
      });

      const hocVienData = await hocVienService.getHocVienList();
      setHocVienList(hocVienData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handlePhuHuynhChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "idQuanHuyen") {
      // Khi chọn Quận/Huyện, tải danh sách Phường/Xã
      try {
        const data = await hocVienService.getPhuongXaList(value);
        setPhuongXaList(data);
        setPhuHuynhForm((prev) => ({
          ...prev,
          maPhuongXa: "", // Reset Phường/Xã
        }));
      } catch (err: any) {
        console.error("Lỗi tải danh sách Phường/Xã:", err);
      }
    } else if (name === "gioiTinh") {
      setPhuHuynhForm((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setPhuHuynhForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleHocVienChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setHocVienForm((prev) => ({
      ...prev,
      [name]: type === "select-one" && name === "gioiTinh" ? value === "true" : value,
    }));
  };

  const handleUpdatePhuHuynh = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!phuHuynhForm.tenPhuHuynh || !phuHuynhForm.sdt || !phuHuynhForm.cccd) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        setSubmitting(false);
        return;
      }

      await hocVienService.updatePhuHuynhInfo(phuHuynhForm);
      setSuccess("Cập nhật thông tin phụ huynh thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddHocVien = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!hocVienForm.tenHocVien || !hocVienForm.ngaySinh) {
        setError("Vui lòng điền đầy đủ thông tin học viên (Tên và Ngày sinh)");
        setSubmitting(false);
        return;
      }

      await hocVienService.createProfile(hocVienForm);
      setSuccess("Thêm học viên thành công!");
      setHocVienForm({
        tenHocVien: "",
        gioiTinh: true,
        cccd: "",
        ngaySinh: "",
      });

      // Reload danh sách học viên
      const updatedList = await hocVienService.getHocVienList();
      setHocVienList(updatedList);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-lock px-6 py-10 md:px-10">
          <Text>Đang tải...</Text>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="content-lock px-6 py-10 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Text as="h1" size="display">
                Hồ Sơ Phụ Huynh & Học Viên
              </Text>
              <Text size="lead" tone="muted" className="mt-2">
                Quản lý thông tin phụ huynh và danh sách học viên
              </Text>
            </div>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              🔐 Đổi mật khẩu
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text size="body" className="text-red-700">
                {error}
              </Text>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Text size="body" className="text-green-700">
                {success}
              </Text>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("phu-huynh")}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === "phu-huynh"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Thông Tin Phụ Huynh
            </button>
            <button
              onClick={() => setActiveTab("hoc-vien")}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === "hoc-vien"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Quản Lý Học Viên
            </button>
          </div>

          {/* Tab: Phụ Huynh */}
          {activeTab === "phu-huynh" && (
            <Card className="bg-white p-6 md:p-8">
              <form onSubmit={handleUpdatePhuHuynh} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên phụ huynh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tenPhuHuynh"
                    value={phuHuynhForm.tenPhuHuynh}
                    onChange={handlePhuHuynhChange}
                    placeholder="Nhập tên phụ huynh"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      name="gioiTinh"
                      value={phuHuynhForm.gioiTinh ? "true" : "false"}
                      onChange={handlePhuHuynhChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="ngaySinh"
                      value={phuHuynhForm.ngaySinh}
                      onChange={handlePhuHuynhChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="sdt"
                      value={phuHuynhForm.sdt}
                      onChange={handlePhuHuynhChange}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cccd"
                      value={phuHuynhForm.cccd}
                      onChange={handlePhuHuynhChange}
                      placeholder="Nhập số CCCD"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idQuanHuyen"
                      onChange={handlePhuHuynhChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {quanHuyenList.map((qh) => (
                        <option key={qh.idQuanHuyen} value={qh.idQuanHuyen}>
                          {qh.tenQuanHuyen}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="maPhuongXa"
                      value={phuHuynhForm.maPhuongXa || ""}
                      onChange={handlePhuHuynhChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={phuongXaList.length === 0}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {phuongXaList.map((px) => (
                        <option key={px.maPhuongXa} value={px.maPhuongXa}>
                          {px.tenPhuongXa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhà, tên đường
                  </label>
                  <input
                    type="text"
                    name="soNhaTenDuong"
                    value={phuHuynhForm.soNhaTenDuong}
                    onChange={handlePhuHuynhChange}
                    placeholder="Nhập số nhà, tên đường"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </Button>
              </form>
            </Card>
          )}

          {/* Tab: Học Viên */}
          {activeTab === "hoc-vien" && (
            <div className="space-y-6">
              {/* Form thêm học viên */}
              <Card className="bg-white p-6 md:p-8">
                <Text as="h3" size="title" className="mb-6">
                  Thêm Học Viên Mới
                </Text>
                <form onSubmit={handleAddHocVien} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên học viên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tenHocVien"
                      value={hocVienForm.tenHocVien}
                      onChange={handleHocVienChange}
                      placeholder="Nhập tên học viên"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gioiTinh"
                        value={hocVienForm.gioiTinh ? "true" : "false"}
                        onChange={handleHocVienChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Nam</option>
                        <option value="false">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="ngaySinh"
                        value={hocVienForm.ngaySinh}
                        onChange={handleHocVienChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CCCD
                    </label>
                    <input
                      type="text"
                      name="cccd"
                      value={hocVienForm.cccd}
                      onChange={handleHocVienChange}
                      placeholder="Nhập số CCCD (tùy chọn)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "Đang thêm..." : "Thêm học viên"}
                  </Button>
                </form>
              </Card>

              {/* Danh sách học viên */}
              <Card className="bg-white p-6 md:p-8">
                <Text as="h3" size="title" className="mb-6">
                  Danh Sách Học Viên ({hocVienList.length})
                </Text>
                {hocVienList.length === 0 ? (
                  <Text tone="muted" className="text-center py-8">
                    Chưa có học viên nào. Hãy thêm học viên mới ở trên.
                  </Text>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Tên Học Viên
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Giới Tính
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Ngày Sinh
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            CCCD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {hocVienList.map((hocVien) => (
                          <tr key={hocVien.idHocVien} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{hocVien.tenHocVien}</td>
                            <td className="py-3 px-4">{hocVien.gioiTinh ? "Nam" : "Nữ"}</td>
                            <td className="py-3 px-4">
                              {new Date(hocVien.ngaySinh).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="py-3 px-4">{hocVien.cccd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => {
          setSuccess('Đổi mật khẩu thành công!');
          setTimeout(() => setSuccess(''), 3000);
        }}
      />
    </main>
  );
}
