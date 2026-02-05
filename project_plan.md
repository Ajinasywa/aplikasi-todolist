## Konteks
- Aplikasi ini adalah aplikasi todo list dengan arsitektur full-stack
- Backend dibangun dengan Go (Golang)
- Database menggunakan PostgreSQL
- Sudah termasuk fitur autentikasi dan manajemen todo
- Frontend dibangun dengan Next.js

## Tugas-tugas yang Harus Dilakukan oleh AI Agent

### 1. Verifikasi Persiapan Awal
- Periksa apakah Go (Golang) sudah terinstall dan versi yang digunakan (minimal Go 1.19 direkomendasikan)
- Periksa apakah PostgreSQL sudah terinstall dan berjalan
- Periksa apakah file-file backend telah terdownload dengan benar setelah pull

### 2. Setup Database
- Bantu membuat database PostgreSQL baru (contoh nama: aplikasi_todolist)
- Bantu membuat file .env di root direktori project dengan konfigurasi:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=[username_postgres_user]
  DB_PASSWORD=[password_postgres_user]
  DB_NAME=aplikasi_todolist
  JWT_SECRET=rahasia_jwt_yang_kuat
  ```
- Jelaskan bahwa file .env tidak boleh di-commit karena alasan keamanan

### 3. Instalasi Dependencies
- Jalankan perintah `go mod tidy` untuk menginstall dependencies Go

### 4. Menjalankan Migrasi Database
- Jelaskan bahwa aplikasi memiliki file migrasi di direktori `migrations/`
- Konfirmasikan bahwa migrasi akan dijalankan otomatis saat server pertama kali dijalankan

### 5. Menjalankan Backend Server
- Sarankan untuk menjalankan server dengan perintah: `go run cmd/server/main.go`
- Alternatif: jalankan script `./run_server.sh`
- Konfirmasikan bahwa server berjalan di port 8080 (atau port lain jika 8080 sudah digunakan)

### 6. Verifikasi Backend Berjalan
- Cek apakah server berhasil berjalan tanpa error
- Coba akses endpoint seperti `/api/health` atau `/api/todos` untuk memastikan server merespons
- Pastikan database connection berhasil

### 7. Integrasi dengan Frontend
- Jelaskan bahwa backend menyediakan API endpoints berikut:
  - POST /api/login - untuk login
  - POST /api/register - untuk register
  - GET /api/todos - untuk mendapatkan todos
  - POST /api/todos - untuk membuat todo baru
  - PUT /api/todos/{id} - untuk mengupdate todo
  - DELETE /api/todos/{id} - untuk menghapus todo
- Bantu mengkonfigurasi CORS jika diperlukan agar frontend bisa mengakses API
- Sarankan penggunaan proxy di sisi Next.js jika perlu

### 8. Testing
- Jika ada file test, sarankan untuk menjalankan: `go test ./...`
- Bantu melakukan testing manual endpoint-endpoint penting

### 9. Troubleshooting Umum
- Jika muncul error "database connection failed", pastikan PostgreSQL berjalan dan konfigurasi .env benar
- Jika muncul error "port already in use", ganti port di konfigurasi atau hentikan proses yang menggunakan port tersebut
- Jika muncul error "dependency not found", jalankan lagi `go mod tidy`

### 10. Validasi Akhir
- Pastikan backend berjalan dengan lancar
- Pastikan semua endpoint API dapat diakses
- Pastikan database connection berfungsi
- Pastikan frontend bisa berkomunikasi dengan backend

## Catatan Tambahan
- Jika ada error saat eksekusi, minta AI untuk memberikan solusi spesifik berdasarkan error message
- Jika ada konfigurasi tambahan yang diperlukan, AI harus memberitahu pengguna
- AI harus memastikan bahwa lingkungan development siap digunakan sebelum melanjutkan ke tahap integrasi dengan frontend