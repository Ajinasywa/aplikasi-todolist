**INSTRUKSI**
Fix bug pada priority level di aplikasi to-do list dengan langkah-langkah berikut:

**BUG YANG DILAPORKAN:**
- Ketika menambah task baru dengan priority level "high", yang tersimpan adalah "medium"
- Ketika edit task dan ganti priority level ke "high", tetap tersimpan sebagai "medium"
- Priority level tidak ter-update dengan benar di database
- Begitu juga dengan low priority


TROUBLESHOOTING CHECKLIST
Frontend:

    Cek apakah priority state ter-update saat dropdown berubah (console.log)
    Cek apakah value dropdown sama persis dengan option value ("high", "medium", "low")
    Cek apakah priority dikirim dalam payload saat submit form
    Cek apakah EditTaskForm juga memiliki bug yang sama

Backend:

    Cek apakah request body menerima field priority (log incoming request)
    Cek apakah ada validation yang override priority ke "medium"
    Cek apakah default value di struct/model memaksa priority = "medium"
    Cek apakah update query benar-benar mengupdate field priority

Database:

    Cek apakah kolom priority ada di table tasks
    Cek apakah default value di database adalah "medium"
    Cek data di database setelah insert/update (SELECT * FROM tasks)

analisis folder projek dan file saya lalu lakukan perbaikan bug
