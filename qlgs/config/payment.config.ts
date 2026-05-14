

export const PAYMENT_CONFIG = {
  defaultPaymentMethod: "Chuyển khoản",

  bankInfo: {
    bankName: "[Tên ngân hàng]", 
    accountNumber: "[Số tài khoản]",
    accountHolder: "[Tên công ty]", 
  },

  qrCodeUrl: "/images/payment-qr.png",

  defaultAmount: 100000,
  
  paymentInstructions: {
    title: "Hướng dẫn thanh toán",
    steps: [
      "Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử",
      "Số tiền sẽ tự động điền",
      "Nội dung chuyển khoản: Đặt lớp - [Tên khóa học]",
      "Xác nhận và hoàn tất giao dịch",
      "Đăng ký sẽ được xác nhận sau khi nhận được thanh toán",
    ],
  },
};

export default PAYMENT_CONFIG;
