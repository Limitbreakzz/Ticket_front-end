# มาตรฐานการตั้งชื่อระบบ (System Naming Conventions)

เพื่อให้การพัฒนาระบบมีความเป็นเอกภาพ โค้ดอ่านง่าย และลดความสับสนของทีมงาน โปรเจกต์นี้มีกฎเกณฑ์การตั้งชื่อในส่วนต่าง ๆ ดังนี้:

---

## 🔌 1. WebSocket (Socket.io)

### 🏷️ Socket Event Names
ใช้รูปแบบ `resource:action` หรือ `resource:state_changed` โดยใช้ตัวเล็กทั้งหมด (lowercase) คั่นด้วยเครื่องหมาย colon (`:`) และ underscore (`_`):
* `ticket:created` — มีการเปิด Ticket ใหม่
* `ticket:updated` — ข้อมูลรายละเอียดหรือผู้รับผิดชอบเปลี่ยน
* `ticket:status_changed` — ตั๋วเปลี่ยนสถานะการดำเนินงาน
* `comment:created` — มีข้อความแชทใหม่ถูกโพสต์
* `notification:new` — มีการแจ้งเตือนใหม่สำหรับแสดงผลที่แถบกระดิ่ง

### 🚪 Socket Room Names
ใช้รูปแบบ `resource:{resourceId}` หรือ `resource:{resourceCode}` โดยใช้ตัวเล็กทั้งหมด:
* `user:{userId}` — ห้องส่วนตัวรับข้อมูลเฉพาะบุคคล
* `ticket:{ticketId}` — ห้องแชทสนทนาสดของแต่ละตั๋วปัญหา
* `department:{departmentCode}` — ห้องรับส่งข้อมูลเฉพาะผู้ปฏิบัติงานในแต่ละแผนก (เช่น `department:IT`, `department:HR`)

---

## 🌐 2. REST API Endpoints
การออกแบบ Endpoint สำหรับ HTTP REST API จะอิงตามทรัพยากรหลัก (Resources) โดยใช้พหูพจน์ (plural nouns) และใช้ HTTP Methods ให้ถูกประเภท:
* `GET /tickets` — ค้นหารายการตั๋วทั้งหมด
* `POST /tickets` — ส่งคำขอเปิดตั๋วใหม่
* `PATCH /tickets/{id}/status` — อัปเดตบางฟิลด์ข้อมูลโดยเฉพาะสถานะของตั๋ว
* `POST /tickets/{id}/comments` — ส่งข้อความแชทประกอบตั๋ว

---

## ⚙️ 3. Functions, Services, and Variables
การตั้งชื่อฟังก์ชัน ตัวแปร และบริการ จะใช้วิธี **camelCase** โดยคำแรกเป็นคำกริยาแสดงลักษณะการกระทำที่ชัดเจน:
* `createTicket()` — ฟังก์ชันสำหรับสร้างใบตั๋วใหม่
* `updateTicketStatus()` — ฟังก์ชันปรับปรุงสถานะตั๋ว
* `sendNotification()` — บริการยิงข้อความแจ้งเตือนหาเป้าหมาย
* `joinTicketRoom()` — ฟังก์ชันให้ Client เข้าร่วมกลุ่มแชท

---

## 🖥️ 4. Controller Classes
ชื่อไฟล์และชื่อคลาสควบคุมในฝั่ง Backend จะขึ้นต้นด้วยตัวใหญ่และจบด้วยคำว่า `Controller` เสมอ (**PascalCase**):
* `TicketController` — คลาสจัดการ Logic เกี่ยวกับตั๋ว
* `NotificationController` — คลาสควบคุมเหตุการณ์แจ้งเตือน
* `AuthController` — คลาสควบคุมการตรวจสอบสิทธิ์และล็อกอิน

---

## 🏛️ 5. โครงสร้างโปรเจกต์และการควบคุม UI (Project Structure & UI Patterns)

### 📦 Backend (`Ticket_back-end`)
* **Swagger API Documentation:**
  * เข้าใช้งานได้ผ่านพาธ `/api-docs` (เช่น `http://localhost:4000/api-docs`)
  * ห้ามตั้งค่า `securityDefinitions` หรือใส่สัญลักษณ์แม่กุญแจในการแสดงผล
  * หน้าเอกสารทำงานร่วมกับเบราว์เซอร์โหมดปกติ (Light Theme) ห้ามใช้ custom CSS แปลงสีเอง
  * อัปเดตเอกสาร API ด้วยการรันคำสั่ง `npm run swagger` (ทำงานผ่านไฟล์ `swagger.js` และเขียนผลลัพธ์ลง `swagger-output.json`)

### ⚛️ Frontend (`Ticket_front-end`)
* **การจัดการสถานะโหลดข้อมูล (Loading & Update States):**
  * **ห้ามใช้กล่องข้อความ Loading Spinner หมุน ๆ เต็มหน้าจอ** หรือบล็อกการทำงานผู้ใช้ (เช่นคำว่า "กำลังดำเนินการอัปเดต...") ระหว่างกดทำรายการหรือบันทึกข้อมูลเด็ดขาด
  * **ต้องใช้โครงร่างจำลองกระพริบ (Skeleton Loader):** 
    * ให้แสดงผลผ่านคอมโพเนนต์ `DetailSkeleton` (ที่มีเอฟเฟกต์ Shimmer กระพริบเบา ๆ) ในหน้าต่างรายละเอียดตั๋ว (`TicketDetailModal.jsx`) ในช่วงที่ `reloading` หรือ `statusUpdating` เป็นจริง

* **การป้องกันความซ้ำซ้อนและการเขียนทับโค้ดเดิม (Code Regression Prevention):**
  * **ก่อนทำการแก้ไขโค้ดทุกครั้ง:** ต้องตรวจสอบโครงสร้างเดิมและฟีเจอร์เดิมก่อนอย่างรอบคอบ เพื่อป้องกันไม่ให้ฟังก์ชันเดิมหรือโค้ดที่เคยแก้ไข/นำออกไปแล้ว ถูกเขียนทับหรือกลับมาแสดงผลซ้ำอีก (เช่น โครงร่าง Skeleton หรือการตั้งค่าหน้าตา Swagger)

