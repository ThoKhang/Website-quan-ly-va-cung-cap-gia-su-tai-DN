IF EXISTS (SELECT * FROM sys.databases WHERE name = N'QuanLyCungCapGiaSuDN')
BEGIN
    USE master;
    ALTER DATABASE QuanLyCungCapGiaSuDN SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyCungCapGiaSuDN;
END
GO
create database QuanLyCungCapGiaSuDN
go 
use QuanLyCungCapGiaSuDN
go
CREATE TABLE PhanQuyenNguoiDung (
    LoaiNguoiDungID CHAR(20) PRIMARY KEY,
    LoaiNguoiDung NVARCHAR(50)
);

CREATE TABLE QuanHuyen (
    idQuanHuyen CHAR(20) PRIMARY KEY,
    tenQuanHuyen NVARCHAR(30)
);

CREATE TABLE CapHoc (
    maCapHoc CHAR(20) PRIMARY KEY,
    tenCapHoc NVARCHAR(50)
);

CREATE TABLE MonHoc (
    idMonHoc CHAR(20) PRIMARY KEY,
    tenMonHoc NVARCHAR(30)
);

CREATE TABLE TietHoc (
    idTietHoc CHAR(20) PRIMARY KEY,
    thu NVARCHAR(30),
    gioBatDau DATETIME,
    gioKetThuc DATETIME,
    soTiet INT
);

-- =====================================================================
-- TẠO CÁC BẢNG CÓ LIÊN KẾT (CÓ KHÓA NGOẠI)
-- =====================================================================

CREATE TABLE TaiKhoan (
    idTaiKhoan CHAR(20) PRIMARY KEY,
    email CHAR(50) unique,
    tenDangNhap NVARCHAR(50) unique,
    anhDaiDien NVARCHAR(50),
    matKhau VARCHAR(100),
    ngayTao DATETIME,
    ngayXoa DATETIME,
    nganHang NVARCHAR(30),
    STK CHAR(20),
    LoaiNguoiDungID CHAR(20),
    FOREIGN KEY (LoaiNguoiDungID) REFERENCES PhanQuyenNguoiDung(LoaiNguoiDungID)
);

CREATE TABLE ThongBao (
    idThongBao CHAR(20) PRIMARY KEY,
    tieuDe NVARCHAR(50),
    noiDungThongBao NVARCHAR(200),
    idTaiKhoan CHAR(20),
    FOREIGN KEY (idTaiKhoan) REFERENCES TaiKhoan(idTaiKhoan)
);

CREATE TABLE NhanVien (
    idNhanVien CHAR(20) PRIMARY KEY,
    idTaiKhoan CHAR(20),
    tenNhanVien NVARCHAR(30),
    SDT CHAR(10),
    chucVu NVARCHAR(30),
    CCCD CHAR(20),
    FOREIGN KEY (idTaiKhoan) REFERENCES TaiKhoan(idTaiKhoan)
);

CREATE TABLE PhuongXa (
    maPhuongXa CHAR(20) PRIMARY KEY,
    tenPhuongXa NVARCHAR(100),
    idQuanHuyen CHAR(20),
    FOREIGN KEY (idQuanHuyen) REFERENCES QuanHuyen(idQuanHuyen)
);

CREATE TABLE PhuHuynh (
    idPhuHuynh CHAR(20) PRIMARY KEY,
    tenPhuHuynh NVARCHAR(50),
    gioiTinh BIT,
    ngaySinh DATETIME,
    SDT CHAR(15),
    CCCD CHAR(20),
    soNhaTenDuong NVARCHAR(50),
    idTaiKhoan CHAR(20),
    idPhuongXa CHAR(20),
    FOREIGN KEY (idTaiKhoan) REFERENCES TaiKhoan(idTaiKhoan),
    FOREIGN KEY (idPhuongXa) REFERENCES PhuongXa(maPhuongXa)
);

CREATE TABLE HocVien (
    idHocVien CHAR(20) PRIMARY KEY,
    tenHocVien NVARCHAR(50),
    gioiTinh BIT, -- SQL Server dùng BIT thay cho BOOLEAN
    CCCD CHAR(20),
    ngaySinh DATETIME,
    idPhuHuynh CHAR(20),
    FOREIGN KEY (idPhuHuynh) REFERENCES PhuHuynh(idPhuHuynh)
);

CREATE TABLE GiaSu (
    idGiaSu CHAR(20) PRIMARY KEY,
    idTaiKhoan CHAR(20),
    tenGiaSu NVARCHAR(50),
    SDT CHAR(15),
    CCCD CHAR(20),
    ngay DATETIME,
    trangThai INT,
    heSoLuong FLOAT, -- SQL Server dùng FLOAT thay cho DOUBLE
    luongHienCon FLOAT,
    FOREIGN KEY (idTaiKhoan) REFERENCES TaiKhoan(idTaiKhoan)
);

CREATE TABLE BangCap (
    idBangCap CHAR(20) PRIMARY KEY,
    idGiaSu CHAR(20),
    tenBangCap NVARCHAR(50),
    thongTinBangCap NVARCHAR(150),
    ngayCap DATETIME,
    trangThai BIT,
    anhMinhChung NVARCHAR(MAX),
    FOREIGN KEY (idGiaSu) REFERENCES GiaSu(idGiaSu)
);

CREATE TABLE LichSuTraLuong (
    idTraLuong CHAR(20) PRIMARY KEY,
    idGiaSu CHAR(20),
    tinhTrang BIT,
    ngayThanhToan DATETIME,
    soTien MONEY,
    phuongThucThanhToan NVARCHAR(50),
    maGiaoDich CHAR(50),
    FOREIGN KEY (idGiaSu) REFERENCES GiaSu(idGiaSu)
);

CREATE TABLE DanhMucLop (
    idDanhMucLop CHAR(20) PRIMARY KEY,
    tenLop NVARCHAR(50),
    maCapHoc CHAR(20),
    FOREIGN KEY (maCapHoc) REFERENCES CapHoc(maCapHoc)
);

CREATE TABLE KhoaHoc (
    idKhoaHoc CHAR(20) PRIMARY KEY,
    tenKhoaHoc NVARCHAR(50),
    moTa NVARCHAR(300),
    yeuCau NVARCHAR(30),
    noiDungKhoaHoc NVARCHAR(MAX),
    soTienHoc MONEY,
    tinhTrang INT DEFAULT 0,
    soBuoiHoc INT,  
    idGiaSu CHAR(20),
    idMonHoc CHAR(20),
    idDanhMucLop CHAR(20),
    anhMinhHoa NVARCHAR(255),
    FOREIGN KEY (idGiaSu) REFERENCES GiaSu(idGiaSu),
    FOREIGN KEY (idMonHoc) REFERENCES MonHoc(idMonHoc),
    FOREIGN KEY (idDanhMucLop) REFERENCES DanhMucLop(idDanhMucLop)
);

CREATE TABLE LichDay (
    idLichDay CHAR(20) PRIMARY KEY,
    tinhTrang BIT,
    idGiaSu CHAR(20),
    idTietHoc CHAR(20),
    FOREIGN KEY (idGiaSu) REFERENCES GiaSu(idGiaSu),
    FOREIGN KEY (idTietHoc) REFERENCES TietHoc(idTietHoc)
);

CREATE TABLE DangKyHoc (
    idDangKy CHAR(20) PRIMARY KEY,
    idPhuHuynh CHAR(20),
    idHocVien CHAR(20),
    idKhoaHoc CHAR(20),
    ngayDangKy DATETIME,
    loaiDangKy NVARCHAR(50),
    trangThaiThanhToan BIT,
    trangThaiHoanThanh BIT,
    ngayBatDauHoc DATETIME,
    FOREIGN KEY (idPhuHuynh) REFERENCES PhuHuynh(idPhuHuynh),
    FOREIGN KEY (idHocVien) REFERENCES HocVien(idHocVien),
    FOREIGN KEY (idKhoaHoc) REFERENCES KhoaHoc(idKhoaHoc)
	);

CREATE TABLE DanhGia (
    idDanhGia CHAR(20) PRIMARY KEY,
    idDangKy CHAR(20),
    soSao INT,
    noiDung NVARCHAR(300),
    ngayDanhGia DATETIME,
    FOREIGN KEY (idDangKy) REFERENCES DangKyHoc(idDangKy)
);

CREATE TABLE LichSuThanhToan (
    idThanhToan CHAR(20) PRIMARY KEY,
    soTien MONEY,
    trangThai NVARCHAR(30),
    ngayThanhToan DATETIME,
    phuongThucThanhToan NVARCHAR(30),
    maGiaoDich CHAR(50),
    idDangKy CHAR(20),
    FOREIGN KEY (idDangKy) REFERENCES DangKyHoc(idDangKy)
);

CREATE TABLE ChiTietLichHoc (
    idLichHoc CHAR(20) PRIMARY KEY,
    idDangKy CHAR(20),
    idLichDay CHAR(20),
    ngayHoc DATETIME,
    tinhTrang NVARCHAR(30),
    FOREIGN KEY (idDangKy) REFERENCES DangKyHoc(idDangKy),
    FOREIGN KEY (idLichDay) REFERENCES LichDay(idLichDay)
);

CREATE TABLE NoiDungNghi (
    idNoiDung CHAR(20) PRIMARY KEY,
    lyDoNghi NVARCHAR(50),
    thoiGianGui DATETIME,
    idLichHoc CHAR(20),
    FOREIGN KEY (idLichHoc) REFERENCES ChiTietLichHoc(idLichHoc)
);
USE QuanLyCungCapGiaSuDN;
GO

-- Thêm quyền Người Dùng vào hệ thống
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('1', N'Người dùng');
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('2', N'Gia Sư');
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('4', N'Admin');
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('3', N'Nhân viên');


INSERT INTO TietHoc (idTietHoc, thu, gioBatDau, gioKetThuc, soTiet) VALUES
('TH_T2_C1', N'Thứ 2', '1900-01-01 17:30:00', '1900-01-01 19:30:00', 2),
('TH_T2_C2', N'Thứ 2', '1900-01-01 19:30:00', '1900-01-01 21:30:00', 2),
('TH_T3_C1', N'Thứ 3', '1900-01-01 17:30:00', '1900-01-01 19:30:00', 2),
('TH_T3_C2', N'Thứ 3', '1900-01-01 19:30:00', '1900-01-01 21:30:00', 2),
('TH_T4_C1', N'Thứ 4', '1900-01-01 17:30:00', '1900-01-01 19:30:00', 2),
('TH_T4_C2', N'Thứ 4', '1900-01-01 19:30:00', '1900-01-01 21:30:00', 2),
('TH_T5_C1', N'Thứ 5', '1900-01-01 17:30:00', '1900-01-01 19:30:00', 2),
('TH_T5_C2', N'Thứ 5', '1900-01-01 19:30:00', '1900-01-01 21:30:00', 2),
('TH_T6_C1', N'Thứ 6', '1900-01-01 17:30:00', '1900-01-01 19:30:00', 2),
('TH_T6_C2', N'Thứ 6', '1900-01-01 19:30:00', '1900-01-01 21:30:00', 2);


-- THÊMDỮ LIỆU QUẬN/HUYỆN VÀ PHƯỜNG/XÃ (ĐÀ NẴNG)
INSERT INTO QuanHuyen (idQuanHuyen, tenQuanHuyen) VALUES
('QH001', N'Hải Châu'),
('QH002', N'Thanh Khê'),
('QH003', N'Sơn Trà'),
('QH004', N'Ngũ Hành Sơn'),
('QH005', N'Liên Chiểu'),
('QH006', N'Cẩm Lệ');

-- Phường/Xã Hải Châu
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, idQuanHuyen) VALUES
('PX001', N'Phường Hải Châu 1', 'QH001'),
('PX002', N'Phường Hải Châu 2', 'QH001'),
('PX003', N'Phường Thanh Bình', 'QH001'),
('PX004', N'Phường Bình Hiên', 'QH001'),
('PX005', N'Phường Bình Thuận', 'QH001');

-- Phường/Xã Thanh Khê
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, idQuanHuyen) VALUES
('PX006', N'Phường Thanh Khê Tây', 'QH002'),
('PX007', N'Phường Thanh Khê Đông', 'QH002'),
('PX008', N'Phường Chính Gián', 'QH002'),
('PX009', N'Phường Thạc Gián', 'QH002');

-- Phường/Xã Sơn Trà
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, idQuanHuyen) VALUES
('PX010', N'Phường Mân Thái', 'QH003'),
('PX011', N'Phường Nại Hiên Đông', 'QH003'),
('PX012', N'Phường Thọ Quang', 'QH003'),
('PX013', N'Phường An Hải Bắc', 'QH003'),
('PX014', N'Phường An Hải Tây', 'QH003');

-- Phường/Xã Ngũ Hành Sơn
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, idQuanHuyen) VALUES
('PX015', N'Phường Mỹ An', 'QH004'),
('PX016', N'Phường Khuê Mỹ', 'QH004');

-- Phường/Xã Liên Chiểu
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, idQuanHuyen) VALUES
('PX017', N'Phường Liên Chiểu', 'QH005'),
('PX018', N'Phường Hòa Khánh Bắc', 'QH005'),
('PX019', N'Phường Hòa Khánh Nam', 'QH005'),
('PX020', N'Phường Hòa Minh', 'QH005');

-- Phường/Xã Cẩm Lệ
INSERT INTO PhuongXa (maPhuongXa, tenPhuongXa, idQuanHuyen) VALUES
('PX021', N'Phường Cẩm Lệ', 'QH006'),
('PX022', N'Phường Hòa Xuân', 'QH006'),
('PX023', N'Phường Hòa Phát', 'QH006');

--------------------------------------------------
INSERT INTO CapHoc (maCapHoc, tenCapHoc) VALUES
('CH001', N'Cấp 1'),
('CH002', N'Cấp 2'),
('CH003', N'Cấp 3');

-- Cấp 1: Lớp 1-5
INSERT INTO DanhMucLop (idDanhMucLop, tenLop, maCapHoc) VALUES
('L1', N'Lớp 1', 'CH001'),
('L2', N'Lớp 2', 'CH001'),
('L3', N'Lớp 3', 'CH001'),
('L4', N'Lớp 4', 'CH001'),
('L5', N'Lớp 5', 'CH001');

-- Cấp 2: Lớp 6-9
INSERT INTO DanhMucLop (idDanhMucLop, tenLop, maCapHoc) VALUES
('L6', N'Lớp 6', 'CH002'),
('L7', N'Lớp 7', 'CH002'),
('L8', N'Lớp 8', 'CH002'),
('L9', N'Lớp 9', 'CH002');

-- Cấp 3: Lớp 10-12
INSERT INTO DanhMucLop (idDanhMucLop, tenLop, maCapHoc) VALUES
('L11', N'Lớp 11', 'CH003'),
('L12', N'Lớp 12', 'CH003');
--('L10', N'Lớp 10', 'CH003'),

INSERT INTO MonHoc (idMonHoc, tenMonHoc) VALUES
('MH001', N'Toán Học'),
('MH002', N'Tiếng Anh'),
('MH003', N'Tiếng Việt'),
('MH004', N'Vật Lý'),
('MH005', N'Hóa Học'),
('MH006', N'Sinh Học'),
('MH007', N'Lịch Sử'),
('MH008', N'Địa Lý'),
('MH009', N'Tin Học'),
('MH010', N'Thể Dục'),
('MH011', N'Âm Nhạc'),
('MH012', N'Mỹ Thuật');


-- 1. INSERT DỮ LIỆU VÀO BẢNG TaiKhoan
-- Tài khoản Gia sư (Format: TK_GS00x)
INSERT INTO TaiKhoan (idTaiKhoan, email, tenDangNhap, anhDaiDien, matKhau, ngayTao, LoaiNguoiDungID) VALUES
('TK_GS001', 'giasu.toan@gmail.com', 'giasu_toan', 'avatar1.jpg', '123456', GETDATE(), '2'),
('TK_GS002', 'giasu.anh@gmail.com', 'giasu_anh', 'avatar2.jpg', '123456', GETDATE(), '2'),
('TK_GS003', 'giasu.ly@gmail.com', 'giasu_ly', 'avatar3.jpg', '123456', GETDATE(), '2'),
('TK_GS004', 'giasu.hoa@gmail.com', 'giasu_hoa', 'avatar4.jpg', '123456', GETDATE(), '2'),
('TK_GS005', 'giasu.sinh@gmail.com', 'giasu_sinh', 'avatar5.jpg', '123456', GETDATE(), '2'),
('TK_GS006', 'giasu.van@gmail.com', 'giasu_van', 'avatar6.jpg', '123456', GETDATE(), '2'),
('TK_GS007', 'giasu.su@gmail.com', 'giasu_su', 'avatar7.jpg', '123456', GETDATE(), '2'),
('TK_GS008', 'giasu.dia@gmail.com', 'giasu_dia', 'avatar8.jpg', '123456', GETDATE(), '2');

-- Tài khoản Phụ huynh (Format: TK_PH00x)
INSERT INTO TaiKhoan (idTaiKhoan, email, tenDangNhap, anhDaiDien, matKhau, ngayTao, LoaiNguoiDungID) VALUES
('TK_PH001', 'phuhuynh.tuan@gmail.com', 'phuhuynh_tuan', 'avatar_ph1.jpg', '123456', GETDATE(), '1'),
('TK_PH002', 'phuhuynh.linh@gmail.com', 'phuhuynh_linh', 'avatar_ph2.jpg', '123456', GETDATE(), '1'),
('TK_PH003', 'phuhuynh.hung@gmail.com', 'phuhuynh_hung', 'avatar_ph3.jpg', '123456', GETDATE(), '1'),
('TK_PH004', 'phuhuynh.mai@gmail.com', 'phuhuynh_mai', 'avatar_ph4.jpg', '123456', GETDATE(), '1'),
('TK_PH005', 'phuhuynh.duc@gmail.com', 'phuhuynh_duc', 'avatar_ph5.jpg', '123456', GETDATE(), '1');


/*-- Tài khoản Admin
INSERT INTO TaiKhoan (idTaiKhoan, email, tenDangNhap, anhDaiDien, matKhau, ngayTao, LoaiNguoiDungID) VALUES
('TK_ADMIN', 'admin@gmail.com', 'admin', 'avatar_admin.jpg', '123456', GETDATE(), '4');


-- Tài khoản Nhân viên
INSERT INTO TaiKhoan (idTaiKhoan, email, tenDangNhap, anhDaiDien, matKhau, ngayTao, LoaiNguoiDungID) VALUES
('TK_NV001', 'nhanvien.support@gmail.com', 'nhanvien_support', 'avatar_nv1.jpg', '123456', GETDATE(), '3');*/


-- 2. INSERT DỮ LIỆU VÀO BẢNG GiaSu (Format: GS00x)
INSERT INTO GiaSu (idGiaSu, idTaiKhoan, tenGiaSu, SDT, CCCD, ngay, trangThai, heSoLuong, luongHienCon) VALUES
('GS001', 'TK_GS001', N'Nguyễn Văn Toán', '0912345001', '123456789001', GETDATE(), 1, 1.0, 5000000),
('GS002', 'TK_GS002', N'Trần Thị Anh', '0912345002', '123456789002', GETDATE(), 1, 1.2, 6000000),
('GS003', 'TK_GS003', N'Lê Minh Lý', '0912345003', '123456789003', GETDATE(), 1, 1.1, 5500000),
('GS004', 'TK_GS004', N'Phạm Hồng Hóa', '0912345004', '123456789004', GETDATE(), 1, 1.0, 5000000),
('GS005', 'TK_GS005', N'Đỗ Quốc Sinh', '0912345005', '123456789005', GETDATE(), 1, 1.3, 6500000),
('GS006', 'TK_GS006', N'Vũ Thị Văn', '0912345006', '123456789006', GETDATE(), 1, 1.1, 5500000),
('GS007', 'TK_GS007', N'Hoàng Văn Sử', '0912345007', '123456789007', GETDATE(), 1, 1.2, 6000000),
('GS008', 'TK_GS008', N'Bùi Thị Địa', '0912345008', '123456789008', GETDATE(), 1, 1.0, 5000000);


-- 3. INSERT DỮ LIỆU VÀO BẢNG BangCap (Mỗi gia sư có 1 bằng cấp)
INSERT INTO BangCap (idBangCap, idGiaSu, tenBangCap, thongTinBangCap, ngayCap, trangThai, anhMinhChung) VALUES
('BC001', 'GS001', N'Bằng Cấp TOIECE', N'Tốt nghiệp Đại học NN', '2020-06-20', 1, 'bangcap1.jpg'),
('BC002', 'GS002', N'Bằng Cấp 3 Tiếng Anh', N'Tốt nghiệp Đại học Ngoại ngữ', '2019-06-20', 1, 'bangcap2.jpg'),
('BC003', 'GS003', N'Bằng Cấp 3 Vật Lý', N'Tốt nghiệp Đại học Sư phạm Vật Lý', '2021-06-10', 1, 'bangcap3.jpg'),
('BC004', 'GS004', N'Bằng Cấp 3 Hóa Học', N'Tốt nghiệp Đại học Sư phạm Hóa Học', '2020-06-15', 1, 'bangcap4.jpg'),
('BC005', 'GS005', N'Bằng Cấp 3 Sinh Học', N'Tốt nghiệp Đại học Sư phạm Sinh Học', '2019-06-20', 1, 'bangcap5.jpg'),
('BC006', 'GS006', N'Bằng Cấp 3 Tiếng Việt', N'Tốt nghiệp Đại học Sư phạm Tiếng Việt', '2021-06-10', 1, 'bangcap6.jpg'),
('BC007', 'GS007', N'Bằng Cấp 3 Lịch Sử', N'Tốt nghiệp Đại học Sư phạm Lịch Sử', '2020-06-15', 1, 'bangcap7.jpg'),
('BC008', 'GS008', N'Bằng Cấp 3 Địa Lý', N'Tốt nghiệp Đại học Sư phạm Địa Lý', '2019-06-20', 1, 'bangcap8.jpg');


-- 4. INSERT DỮ LIỆU VÀO BẢNG KhoaHoc
INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH001', N'Toán 10 Cơ Bản', N'Khóa học toán lớp 10', N'Lớp 10', N'Lượng giác, phương trình', 500000, 'GS001', 'MH001', 'L11', 1, 10),
('KH002', N'Toán 11 Nâng Cao', N'Khóa học toán lớp 11 nâng cao', N'Lớp 11', N'Lượng giác, đạo hàm, tích phân', 600000, 'GS001', 'MH001', 'L11', 1, 15),
('KH003', N'Toán 12 Ôn Thi', N'Khóa học ôn thi THPT Quốc Gia', N'Lớp 12', N'Ôn tập toàn bộ kiến thức lớp 12', 700000, 'GS001', 'MH001', 'L12', 1, 20);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH004', N'Tiếng Anh 10 Cơ Bản', N'Khóa học tiếng Anh lớp 10', N'Lớp 10', N'Ngữ pháp, từ vựng, kỹ năng nghe nói', 450000, 'GS002', 'MH002', 'L11', 1, 12),
('KH005', N'Tiếng Anh 11 Nâng Cao', N'Khóa học tiếng Anh lớp 11', N'Lớp 11', N'Ngữ pháp nâng cao, viết luận', 550000, 'GS002', 'MH002', 'L11', 1, 15),
('KH006', N'Tiếng Anh 12 Ôn Thi', N'Khóa học ôn thi THPT', N'Lớp 12', N'Ôn tập toàn bộ kiến thức', 650000, 'GS002', 'MH002', 'L12', 1, 18),
('KH007', N'IELTS Cơ Bản', N'Khóa học IELTS từ cơ bản', N'Lớp 10+', N'Chuẩn bị thi IELTS', 800000, 'GS002', 'MH002', 'L12', 1, 20);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH008', N'Vật Lý 10 Cơ Bản', N'Khóa học vật lý lớp 10', N'Lớp 10', N'Cơ học, nhiệt học', 500000, 'GS003', 'MH004', 'L11', 1, 12),
('KH009', N'Vật Lý 11 Nâng Cao', N'Khóa học vật lý lớp 11', N'Lớp 11', N'Điện từ, quang học', 600000, 'GS003', 'MH004', 'L11', 1, 15),
('KH010', N'Vật Lý 12 Ôn Thi', N'Khóa học ôn thi THPT', N'Lớp 12', N'Ôn tập toàn bộ kiến thức', 700000, 'GS003', 'MH004', 'L12', 1, 18);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH011', N'Hóa Học 10 Cơ Bản', N'Khóa học hóa học lớp 10', N'Lớp 10', N'Hóa học vô cơ cơ bản', 500000, 'GS004', 'MH005', 'L11', 1, 12),
('KH012', N'Hóa Học 11-12 Nâng Cao', N'Khóa học hóa học lớp 11-12', N'Lớp 11-12', N'Hóa học hữu cơ, ôn thi', 650000, 'GS004', 'MH005', 'L12', 1, 18);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH013', N'Sinh Học 10 Cơ Bản', N'Khóa học sinh học lớp 10', N'Lớp 10', N'Tế bào, di truyền', 450000, 'GS005', 'MH006', 'L11', 1, 12),
('KH014', N'Sinh Học 11 Nâng Cao', N'Khóa học sinh học lớp 11', N'Lớp 11', N'Tiến hóa, sinh thái', 550000, 'GS005', 'MH006', 'L11', 1, 15),
('KH015', N'Sinh Học 12 Ôn Thi', N'Khóa học ôn thi THPT', N'Lớp 12', N'Ôn tập toàn bộ kiến thức', 650000, 'GS005', 'MH006', 'L12', 1, 18),
('KH016', N'Sinh Học Cấp 2', N'Khóa học sinh học cấp 2', N'Lớp 6-9', N'Kiến thức sinh học cơ bản', 350000, 'GS005', 'MH006', 'L9', 1, 10),
('KH017', N'Sinh Học Cấp 1', N'Khóa học sinh học cấp 1', N'Lớp 4-5', N'Kiến thức sinh học rất cơ bản', 300000, 'GS005', 'MH006', 'L5', 1, 8);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH018', N'Tiếng Việt 10-11', N'Khóa học tiếng Việt lớp 10-11', N'Lớp 10-11', N'Văn học, ngữ pháp', 400000, 'GS006', 'MH003', 'L11', 1, 12),
('KH019', N'Tiếng Việt 12 Ôn Thi', N'Khóa học ôn thi THPT', N'Lớp 12', N'Ôn tập toàn bộ kiến thức', 500000, 'GS006', 'MH003', 'L12', 1, 15);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH020', N'Lịch Sử 10 Cơ Bản', N'Khóa học lịch sử lớp 10', N'Lớp 10', N'Lịch sử thế giới', 400000, 'GS007', 'MH007', 'L11', 1, 12),
('KH021', N'Lịch Sử 11 Nâng Cao', N'Khóa học lịch sử lớp 11', N'Lớp 11', N'Lịch sử Việt Nam', 450000, 'GS007', 'MH007', 'L11', 1, 12),
('KH022', N'Lịch Sử 12 Ôn Thi', N'Khóa học ôn thi THPT', N'Lớp 12', N'Ôn tập toàn bộ kiến thức', 550000, 'GS007', 'MH007', 'L12', 1, 15);

INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, moTa, yeuCau, noiDungKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop, tinhTrang, soBuoiHoc) VALUES
('KH023', N'Địa Lý 10 Cơ Bản', N'Khóa học địa lý lớp 10', N'Lớp 10', N'Địa lý tự nhiên', 400000, 'GS008', 'MH008', 'L11', 1, 12),
('KH024', N'Địa Lý 11 Nâng Cao', N'Khóa học địa lý lớp 11', N'Lớp 11', N'Địa lý kinh tế', 450000, 'GS008', 'MH008', 'L11', 1, 12),
('KH025', N'Địa Lý 12 Ôn Thi', N'Khóa học ôn thi THPT', N'Lớp 12', N'Ôn tập toàn bộ kiến thức', 550000, 'GS008', 'MH008', 'L12', 1, 15),
('KH026', N'Địa Lý Cấp 2', N'Khóa học địa lý cấp 2', N'Lớp 6-9', N'Kiến thức địa lý cơ bản', 350000, 'GS008', 'MH008', 'L9', 1, 10);

-- 5. INSERT DỮ LIỆU VÀO BẢNG PhuHuynh
INSERT INTO PhuHuynh (idPhuHuynh, tenPhuHuynh, gioiTinh, ngaySinh, SDT, CCCD, soNhaTenDuong, idTaiKhoan, idPhuongXa) VALUES
('PH001', N'Trần Văn Tuấn', 1, '1980-05-15', '0901234001', '123456789001', N'123 Đường Nguyễn Huệ', 'TK_PH001', 'PX001'),
('PH002', N'Lê Thị Linh', 0, '1985-08-20', '0901234002', '123456789002', N'456 Đường Trần Phú', 'TK_PH002', 'PX002'),
('PH003', N'Phạm Văn Hùng', 1, '1982-03-10', '0901234003', '123456789003', N'789 Đường Lê Lợi', 'TK_PH003', 'PX003'),
('PH004', N'Nguyễn Thị Mai', 0, '1988-11-25', '0901234004', '123456789004', N'321 Đường Hàng Đẫy', 'TK_PH004', 'PX004'),
('PH005', N'Đỗ Văn Đức', 1, '1983-07-12', '0901234005', '123456789005', N'654 Đường Bà Triệu', 'TK_PH005', 'PX005');



-- 6. INSERT DỮ LIỆU VÀO BẢNG HocVien (Format: HV00x)
INSERT INTO HocVien (idHocVien, tenHocVien, gioiTinh, CCCD, ngaySinh, idPhuHuynh) VALUES
('HV001', N'Trần Văn Bình', 1, '123456789001', '2008-05-15', 'PH001'),
('HV002', N'Lê Thị Hương', 0, '123456789002', '2009-08-20', 'PH002'),
('HV003', N'Phạm Văn Hải', 1, '123456789003', '2007-03-10', 'PH003'),
('HV004', N'Nguyễn Thị Hoa', 0, '123456789004', '2010-11-25', 'PH004'),
('HV005', N'Đỗ Văn Minh', 1, '123456789005', '2008-07-12', 'PH005');

-- 7. INSERT DỮ LIỆU VÀO BẢNG DangKyHoc
INSERT INTO DangKyHoc (idDangKy, idPhuHuynh, idHocVien, idKhoaHoc, ngayDangKy, loaiDangKy, trangThaiThanhToan, trangThaiHoanThanh, ngayBatDauHoc) VALUES
('DK001', 'PH001', 'HV001', 'KH001', '2024-01-10', N'Đăng ký', 1, 0, '2024-01-15'),
('DK002', 'PH001', 'HV001', 'KH002', '2024-02-10', N'Đăng ký', 1, 0, '2024-02-15'),
('DK003', 'PH002', 'HV002', 'KH004', '2024-01-12', N'Đăng ký', 1, 0, '2024-01-17'),
('DK004', 'PH002', 'HV002', 'KH005', '2024-02-12', N'Đăng ký', 1, 0, '2024-02-17'),
('DK005', 'PH003', 'HV003', 'KH008', '2024-01-14', N'Đăng ký', 1, 0, '2024-01-19'),
('DK006', 'PH003', 'HV003', 'KH009', '2024-02-14', N'Đăng ký', 1, 0, '2024-02-19'),
('DK007', 'PH004', 'HV004', 'KH011', '2024-01-16', N'Đăng ký', 1, 0, '2024-01-21'),
('DK008', 'PH004', 'HV004', 'KH012', '2024-02-16', N'Đăng ký', 1, 0, '2024-02-21'),
('DK009', 'PH005', 'HV005', 'KH013', '2024-01-18', N'Đăng ký', 1, 0, '2024-01-23'),
('DK010', 'PH005', 'HV005', 'KH014', '2024-02-18', N'Đăng ký', 1, 0, '2024-02-23');

-- 8. INSERT DỮ LIỆU VÀO BẢNG DanhGia
INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG001', 'DK001', 5, N'Gia sư rất tâm huyết, giảng dạy rõ ràng, con em tôi tiến bộ rất nhiều', '2024-02-01'),
('DG002', 'DK001', 4, N'Tốt, nhưng có thể cải thiện tốc độ giảng dạy', '2024-02-15');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG003', 'DK002', 5, N'Xuất sắc! Gia sư giải thích rất kỹ lưỡng', '2024-03-01'),
('DG004', 'DK002', 5, N'Rất hài lòng với chất lượng dạy học', '2024-03-15');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG005', 'DK003', 5, N'Gia sư rất nhiệt tình, con em tôi yêu thích tiếng Anh hơn', '2024-02-05'),
('DG006', 'DK003', 4, N'Tốt, nhưng cần thêm bài tập thực hành', '2024-02-20');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG007', 'DK004', 5, N'Phương pháp dạy rất hiệu quả, con em tôi đã cải thiện điểm số', '2024-03-05'),
('DG008', 'DK004', 5, N'Rất chuyên nghiệp và tận tâm', '2024-03-20');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG009', 'DK005', 4, N'Gia sư giải thích tốt, nhưng có thể thêm ví dụ thực tế', '2024-02-10'),
('DG010', 'DK005', 5, N'Rất tốt, con em tôi hiểu bài hơn', '2024-02-25');


INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG011', 'DK006', 5, N'Xuất sắc! Gia sư rất am hiểu môn học', '2024-03-10'),
('DG012', 'DK006', 4, N'Tốt, nhưng cần cải thiện kỹ năng giao tiếp', '2024-03-25');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG013', 'DK007', 5, N'Gia sư rất tâm huyết, giảng dạy rõ ràng', '2024-02-12'),
('DG014', 'DK007', 5, N'Rất hài lòng, con em tôi yêu thích hóa học', '2024-02-27');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG015', 'DK008', 4, N'Tốt, nhưng có thể cải thiện tốc độ giảng dạy', '2024-03-12'),
('DG016', 'DK008', 5, N'Rất chuyên nghiệp', '2024-03-27');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG017', 'DK009', 5, N'Gia sư rất giỏi, con em tôi tiến bộ rất nhanh', '2024-02-14'),
('DG018', 'DK009', 5, N'Xuất sắc! Rất tâm huyết', '2024-02-29');

INSERT INTO DanhGia (idDanhGia, idDangKy, soSao, noiDung, ngayDanhGia) VALUES
('DG019', 'DK010', 5, N'Rất tốt, con em tôi yêu thích sinh học', '2024-03-14'),
('DG020', 'DK010', 4, N'Tốt, nhưng cần thêm bài tập', '2024-03-29');

-- =====================================================================
-- INSERT LỊCH RẢNH CHO CÁC GIA SƯ
INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS001_001', 1, 'GS001', 'TH_T2_C1'),  -- Thứ 2, 17:30-19:30
('LD_GS001_002', 1, 'GS001', 'TH_T4_C1'),  -- Thứ 4, 17:30-19:30
('LD_GS001_003', 1, 'GS001', 'TH_T6_C2');  -- Thứ 6, 19:30-21:30

INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS002_001', 1, 'GS002', 'TH_T3_C1'),  -- Thứ 3, 17:30-19:30
('LD_GS002_002', 1, 'GS002', 'TH_T5_C1'),  -- Thứ 5, 17:30-19:30
('LD_GS002_003', 1, 'GS002', 'TH_T4_C2'),  -- Thứ 4, 19:30-21:30
('LD_GS002_004', 1, 'GS002', 'TH_T2_C2');  -- Thứ 2, 19:30-21:30
INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS003_001', 1, 'GS003', 'TH_T2_C1'),  -- Thứ 2, 17:30-19:30
('LD_GS003_002', 1, 'GS003', 'TH_T4_C2'),  -- Thứ 4, 19:30-21:30
('LD_GS003_003', 1, 'GS003', 'TH_T6_C1');  -- Thứ 6, 17:30-19:30

INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS004_001', 1, 'GS004', 'TH_T3_C1'),  -- Thứ 3, 17:30-19:30
('LD_GS004_002', 1, 'GS004', 'TH_T5_C2');  -- Thứ 5, 19:30-21:30

INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS005_001', 1, 'GS005', 'TH_T2_C2'),  -- Thứ 2, 19:30-21:30
('LD_GS005_002', 1, 'GS005', 'TH_T3_C2'),  -- Thứ 3, 19:30-21:30
('LD_GS005_003', 1, 'GS005', 'TH_T5_C1'),  -- Thứ 5, 17:30-19:30
('LD_GS005_004', 1, 'GS005', 'TH_T6_C2');  -- Thứ 6, 19:30-21:30

INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS006_001', 1, 'GS006', 'TH_T2_C1'),  -- Thứ 2, 17:30-19:30
('LD_GS006_002', 1, 'GS006', 'TH_T4_C1'),  -- Thứ 4, 17:30-19:30
('LD_GS006_003', 1, 'GS006', 'TH_T5_C2');  -- Thứ 5, 19:30-21:30

INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS007_001', 1, 'GS007', 'TH_T3_C1'),  -- Thứ 3, 17:30-19:30
('LD_GS007_002', 1, 'GS007', 'TH_T6_C1');  -- Thứ 6, 17:30-19:30

INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES
('LD_GS008_001', 1, 'GS008', 'TH_T2_C2'),  -- Thứ 2, 19:30-21:30
('LD_GS008_002', 1, 'GS008', 'TH_T4_C2'),  -- Thứ 4, 19:30-21:30
('LD_GS008_003', 1, 'GS008', 'TH_T5_C1');  -- Thứ 5, 17:30-19:30

select * from PhuHuynh
select * from KhoaHoc
select * from DangKyHoc
select * from ChiTietLichHoc
select * from LichDay
select * from TietHoc
select * from PhuHuynh
select * from TaiKhoan
select * from HocVien
select * from KhoaHoc
select * from GiaSu
select * from MonHoc
select * from PhanQuyenNguoiDung
select * from LichDay
select * from DanhMucLop
select * from DanhGia