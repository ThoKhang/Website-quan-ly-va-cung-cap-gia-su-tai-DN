"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Text } from "@/component/ui";
import { hocVienService } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function RequestAbsencePage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [lyDoNghi, setLyDoNghi] = useState("");

  const idLichHoc = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setWarning("");

    try {
      if (!lyDoNghi.trim()) {
        setError("Vui lòng nhập lý do xin nghỉ");
        setLoading(false);
        return;
      }

      const response = await hocVienService.requestAbsence({
        idLichHoc,
        lyDoNghi,
      });

      // Kiểm tra xem response có chứa cảnh báo không
      if (response && response.includes("⚠️ CẢNH BÁO")) {
        setWarning(response);
        setSuccess("Yêu cầu xin nghỉ đã được gửi thành công!");
      } else {
        setSuccess(response || "Yêu cầu xin nghỉ đã được gửi thành công!");
      }

      setLyDoNghi("");
      setTimeout(() => router.back(), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="content-lock px-6 py-10 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Text as="h1" size="display">
              Xin Nghỉ Học
            </Text>
            <Text size="lead" tone="muted" className="mt-2">
              Gửi yêu cầu xin nghỉ buổi học này
            </Text>
          </div>

          <Card className="bg-white p-6 md:p-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Text size="body" className="text-blue-700">
                ℹ️ Lưu ý: Bạn phải gửi yêu cầu xin nghỉ trước giờ học ít nhất 12 tiếng. Bạn được phép xin nghỉ tối đa 3 buổi trong một khóa học. Nếu xin nghỉ lần thứ 4 trở đi, bạn có thể bị đình chỉ học hoặc mất quyền lợi khác.
              </Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Text size="body" className="text-red-700">
                    ❌ {error}
                  </Text>
                </div>
              )}

              {warning && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Text size="body" className="text-yellow-700 whitespace-pre-wrap">
                    {warning}
                  </Text>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Text size="body" className="text-green-700">
                    ✅ {success}
                  </Text>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do xin nghỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={lyDoNghi}
                  onChange={(e) => setLyDoNghi(e.target.value)}
                  placeholder="Nhập lý do xin nghỉ (ví dụ: Bệnh, công việc khẩn cấp, ...)"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Quay lại
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
