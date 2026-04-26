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
    tenDangNhap NVARCHAR(50),
    anhDaiDien NVARCHAR(50),
    matKhau CHAR(15),
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