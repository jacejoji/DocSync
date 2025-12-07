# 🏥 DocSync  
*A Full Doctor & Hospital Workflow Management System*

DocSync is a modern platform designed for hospitals and clinics to manage doctors, appointments, HR workflows, payroll, patient records, compliance, insurance, and internal operations — all in one synchronized system.

Built to replace outdated spreadsheets and fragmented tools, DocSync brings everything together using a clean UI, role-based access, and a deep relational database model.

---

## ✨ Current Status

| Module | State |
|--------|-------|
| 🏠 Landing Page | ✅ Complete |
| 🔐 Admin Login | ✅ Complete |
| 👨‍⚕️ Doctor Login | ✅ Complete |
| ⏳ Loading Screen | ✅ Complete |
| 📊 Dashboards | 🚧 In Progress |
| 🔗 Backend Integration (Auth + API) | 🔜 Next Step |

---

## 🧠 Key Features

| Category | Highlights |
|----------|------------|
| 👨‍⚕️ **Doctor Management** | Profiles, documents, specialization, insurance policies, training, equipment assignment, attendance, performance reviews |
| 📅 **Appointments & Clinical Flow** | Booking, queue, patient history, notes, follow-ups |
| ❤️ **Patient Module** | Patient records, emergency contacts, insurance policies, claims |
| 💼 **HR & Workflow Automation** | Payroll, overtime, leave requests, grievances, resignation workflow |
| 🛡 **Security & Roles** | Admin portal, doctor portal, audit trail, notifications |
| 🧾 **Compliance & Records** | Training logs, policy expiry tracking, document management |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (UI) | React + Vite |
| Styling | TailwindCSS + **shadcn/ui** components |
| Icons | Lucide React |
| State/UX | Role-based UI, theme management, clean layout patterns |
| Backend | Java Spring Boot |
| Database | MySQL (Fully structured relational schema) |

---
```text
📂 DocSync/
├── 📂 DocSync(Frontend)/
│   ├── 📂 src/
│   │   ├── 📂 pages/         # Login screens, Landing, future dashboards
│   │   ├── 📂 components/    # UI + shared layout
│   │   ├── 📂 auth/          # Login logic
│   │   └── ⚛️ App.jsx        # Routes + Providers
│   └── ⚙️ tailwind.config.js
├── 📂 DocSync(Backend)/
│   ├── 📂 src/main/java/...  # Spring Boot services, controllers, models
│   └── 📄 application.properties
└── 📂 database/
    └── 🗄️ schema.sql         # Hospital-grade relational schema
```
---

## 🗄 Database Overview

DocSync is built on a **true hospital workflow schema**, not CRUD tables.

### Modules in DB:

- **Doctors:** `doctors`, `doctor_profiles`, `doctor_documents`, `doctor_equipment`, `performance_reviews`
- **Patients:** `patients`, `patient_records`, `appointments`
- **Insurance:** `insurance_providers`, `patient_insurance_policies`, `doctor_insurance_policies`, `insurance_claims`
- **HR & Workflow:** `payroll`, `shift_changes`, `leave_requests`, `attendance_records`, `task_assignments`
- **Operations:** `departments`, `equipment`, `medical_camps`, `training_periods`, `audit_logs`, `notifications`

➡ Full SQL included in `database/schema.sql`.

---

## 🧪 Running the Project

### 1️⃣ Clone Repo

```bash
git clone https://github.com/yourusername/docsync.git
cd docsync
```
2️⃣ Install Frontend Dependencies
```bash
cd frontend
npm install
```
3️⃣ Start Frontend
```bash
npm run dev
```

4️⃣ Start Backend (Spring Boot)
```bash
cd ../backend
mvn spring-boot:run
```

⚙️ Configuration
Frontend .env
VITE_API_URL=http://localhost:8080

Backend .env (Spring)
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/docsync
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=YOURPASSWORD

🧭 Roadmap
Feature	Status
JWT authentication + RBAC	🔜
Doctor Dashboard	🔜
Audit Log Viewer + Notifications	🔜
Appointment Calendar + Queue	🔜
Reporting & Analytics	🔜
Mobile Friendly Portal	🔜
🎥 UI Preview (Current Progress)

✔ Minimal clean login screens
✔ Role-based entry points
✔ Theme toggle support (Light/Dark)
✔ Modern hospital SaaS aesthetics

🤝 Contributing

Contributions, ideas, bug reports & improvements are welcome.

Before submitting a PR:

Open an Issue

Describe requested feature or fix

Attach UI mock or example where applicable

📜 License

🚧 Currently private – licensing will be added upon stable release.

👤 Authors
Jace Joji, Gowri
India 🇮🇳
Project: DocSync — Hospital Doctor Management System

Healthcare is complex — software shouldn’t be. DocSync organizes the operational chaos so hospitals can focus on delivering care.
