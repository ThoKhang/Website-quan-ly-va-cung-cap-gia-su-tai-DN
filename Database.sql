USE master;
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'QuanLyCungCapGiaSuDN')
BEGIN
    ALTER DATABASE QuanLyCungCapGiaSuDN SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyCungCapGiaSuDN;
END;
-- =====================================================================
-- TẠO CÁC BẢNG DANH MỤC (KHÔNG CÓ KHÓA NGOẠI) TRƯỚC
-- =====================================================================
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
    email CHAR(50),
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
    idGiaSu CHAR(20),
    idMonHoc CHAR(20),
    idDanhMucLop CHAR(20),
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

-- 1. Thêm Quyền và Tài khoản để test Login
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('2', N'Gia Sư');
INSERT INTO TaiKhoan (idTaiKhoan, tenDangNhap, matKhau, LoaiNguoiDungID) VALUES ('TK01', 'giasu01', '123456', '2');

-- 2. Thêm Gia sư, Môn, Lớp, Tiết để test Tạo Khóa Học
INSERT INTO GiaSu (idGiaSu, idTaiKhoan, tenGiaSu) VALUES ('GS01', 'TK01', N'Nguyễn Văn A');
INSERT INTO CapHoc (maCapHoc, tenCapHoc) VALUES ('C3', N'Cấp 3');
INSERT INTO DanhMucLop (idDanhMucLop, tenLop, maCapHoc) VALUES ('L10', N'Lớp 10', 'C3');
INSERT INTO MonHoc (idMonHoc, tenMonHoc) VALUES ('MH01', N'Toán Học');
INSERT INTO TietHoc (idTietHoc, thu, soTiet) VALUES ('TH01', N'Thứ 2 - Ca 1', 2);
INSERT INTO TietHoc (idTietHoc, thu, soTiet) VALUES ('TH02', N'Thứ 4 - Ca 2', 2);

select * from TaiKhoan
USE QuanLyCungCapGiaSuDN;
GO
UPDATE TaiKhoan 
SET email = 'giasu@gmail.com' 
WHERE tenDangNhap = 'giasu01';

USE QuanLyCungCapGiaSuDN;
GO

select * from PhanQuyenNguoiDung
-- Thêm quyền Người Dùng vào hệ thống
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) 
VALUES ('1', N'Người dùng');
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('4', N'Admin');
INSERT INTO PhanQuyenNguoiDung (LoaiNguoiDungID, LoaiNguoiDung) VALUES ('3', N'Nhân viên');

select * from PhuHuynh
select * from KhoaHoc

USE QuanLyCungCapGiaSuDN;
GO

/*
-- 2. Tạo tài khoản Gia sư (Mật khẩu băm của '123456')
INSERT INTO TaiKhoan (idTaiKhoan, tenDangNhap, matKhau, LoaiNguoiDungID, email) 
VALUES ('TK001', 'giasua', '$2a$10$7R.v/u.6U3DUM1SIs1iGzeXpUqX0.gJ6p.6Y5/5f1l/v9rG2M5/W.', '2', 'giasu@gmail.com');

-- 3. Tạo thông tin Gia sư
INSERT INTO GiaSu (idGiaSu, idTaiKhoan, tenGiaSu, trangThai) VALUES ('GS001', 'TK001', N'Nguyễn Văn Gia Sư', 1);

-- 4. Tạo Danh mục (Môn, Cấp, Lớp)
INSERT INTO MonHoc (idMonHoc, tenMonHoc) VALUES ('MH001', N'Toán Học');
INSERT INTO CapHoc (maCapHoc, tenCapHoc) VALUES ('CH001', N'Cấp 3');
INSERT INTO DanhMucLop (idDanhMucLop, tenLop, maCapHoc) VALUES ('L12', N'Lớp 12', 'CH001');

-- 5. Tạo Khóa học của Gia sư GS001
INSERT INTO KhoaHoc (idKhoaHoc, tenKhoaHoc, soTienHoc, idGiaSu, idMonHoc, idDanhMucLop) 
VALUES ('KH001', N'Toán 12 Cơ Bản', 500000, 'GS001', 'MH001', 'L12');

-- 6. Tạo Tiết học và Lịch dạy (Trạng thái 1 = Đang rảnh)
INSERT INTO TietHoc (idTietHoc, thu, soTiet) VALUES ('TH01', N'Thứ 2', 2), ('TH02', N'Thứ 4', 2);
INSERT INTO LichDay (idLichDay, tinhTrang, idGiaSu, idTietHoc) VALUES ('LD001', 1, 'GS001', 'TH01'), ('LD002', 1, 'GS001', 'TH02');

-- 7. Tạo tài khoản Phụ huynh và Hồ sơ Phụ huynh + Học viên
INSERT INTO TaiKhoan (idTaiKhoan, tenDangNhap, matKhau, LoaiNguoiDungID, email) 
VALUES ('TK002', 'phuhuynha', '$2a$10$7R.v/u.6U3DUM1SIs1iGzeXpUqX0.gJ6p.6Y5/5f1l/v9rG2M5/W.', '1', 'phuhuynh@gmail.com');

INSERT INTO PhuHuynh (idPhuHuynh, idTaiKhoan, tenPhuHuynh) VALUES ('PH001', 'TK002', N'Trần Thị Phụ Huynh');

INSERT INTO HocVien (idHocVien, idPhuHuynh, tenHocVien) VALUES ('HV001', 'PH001', N'Nguyễn Văn Học Viên');
*/
select * from DangKyHoc
select * from ChiTietLichHoc
select * from LichDay
select * from TietHoc
select * from PhuHuynh
select * from TaiKhoan
