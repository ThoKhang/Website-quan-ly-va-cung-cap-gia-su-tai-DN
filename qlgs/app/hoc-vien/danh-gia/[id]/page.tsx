"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Text } from "@/component/ui";
import { hocVienService } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function RateCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [noiDung, setNoiDung] = useState("");

  const idDangKy = params.id as string;

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

    try {
      if (soSao < 1 || soSao > 5) {
        setError("Vui lòng chọn số sao từ 1 đến 5");
        setLoading(false);
        return;
      }

      await hocVienService.rateCourse({
        idDangKy,
        soSao,
        noiDung,
      });

      setSuccess("Cảm ơn bạn đã gửi đánh giá!");
      setSoSao(5);
      setNoiDung("");
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSoSao(star)}
            className={`text-4xl transition ${
              star <= soSao ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <main className="page-shell">
      <div className="content-lock px-6 py-10 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Text as="h1" size="display">
              Đánh Giá Khóa Học
            </Text>
            <Text size="lead" tone="muted" className="mt-2">
              Chia sẻ trải nghiệm của bạn về khóa học này
            </Text>
          </div>

          <Card className="bg-white p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Text size="body" className="text-red-700">
                    {error}
                  </Text>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Text size="body" className="text-green-700">
                    {success}
                  </Text>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Đánh giá của bạn <span className="text-red-500">*</span>
                </label>
                {renderStars()}
                <Text size="caption" tone="muted" className="mt-2">
                  Bạn đã chọn: {soSao} sao
                </Text>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét (tùy chọn)
                </label>
                <textarea
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  placeholder="Chia sẻ ý kiến của bạn về khóa học, gia sư, phương pháp dạy, ..."
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
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
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
