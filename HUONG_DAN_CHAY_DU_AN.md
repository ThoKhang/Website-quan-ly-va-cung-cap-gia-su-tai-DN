# Huong Dan Chay Du An Backend

## 1. Yeu cau moi truong

- Java 17
- SQL Server
- Maven Wrapper (da co san trong thu muc `tutormanagement/`)

## 2. Chuan bi co so du lieu

1. Tao database trong SQL Server voi ten:

```sql
QuanLyCungCapGiaSuDN
```

2. Chay file [Database.sql](/home/manhdev/Student/DAPM/BE/Database.sql) de tao bang va du lieu ban dau neu can.

3. Kiem tra lai cau hinh ket noi trong [application.properties](/home/manhdev/Student/DAPM/BE/tutormanagement/src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=QuanLyCungCapGiaSuDN;encrypt=true;trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=123
```

Neu may cua ban dung user, password, port, hoac ten database khac, hay sua file nay truoc khi chay.

## 3. Chay du an

Di chuyen vao thu muc backend:
êm response object riêng để frontend dễ xử lý filter/search
```bash
cd /home/manhdev/Student/DAPM/BE/tutormanagement
```

Neu dung Linux/macOS:

```bash
./mvnw spring-boot:run
```

Neu dung Windows:

```bash
mvnw.cmd spring-boot:run
```

Mac dinh ung dung se chay o:

```text
http://localhost:8080
```

## 4. Build du an

Linux/macOS:

```bash
./mvnw clean package
```

Windows:

```bash
mvnw.cmd clean package
```

File jar sau khi build xong nam trong thu muc `tutormanagement/target/`.

## 5. Luu y

- Du an dang dung `spring.jpa.hibernate.ddl-auto=update`, vi vay schema co the duoc tu dong cap nhat theo entity.
- Neu da tao bang bang tay tu file SQL va khong muon Hibernate can thiep schema, co the doi:

```properties
spring.jpa.hibernate.ddl-auto=none
```

- Neu gap loi ket noi SQL Server, kiem tra lai service SQL Server, cong `1433`, user `sa`, va mat khau trong file cau hinh.
