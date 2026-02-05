# Bug Report & Fix: Priority Level di To-Do List

## 1. Bug yang Dilaporkan
- Saat menambah task baru dengan **priority = "high"**, yang tersimpan di database adalah `"medium"`.
- Saat edit task dan mengubah priority menjadi `"high"`, tetap tersimpan sebagai `"medium"`.
- Priority level tidak ter-update dengan benar.
- Hal yang sama berlaku untuk **low priority**.

---

## 2. Analisis Masalah Berdasarkan Folder/Arsitektur Project

### 2.1 Frontend
**File yang kemungkinan terlibat:**  
- `AddTaskForm.jsx` / `AddTaskForm.tsx`  
- `EditTaskForm.jsx` / `EditTaskForm.tsx`  

**Checklist Debug Frontend:**
1. **Cek state priority**
```javascript
const [priority, setPriority] = useState("medium");
// console.log(priority) di handleChange dropdown
