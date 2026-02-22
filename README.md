# Collabxx — Together we build.

> A full-stack SaaS student project collaboration hub. Create teams, manage tasks, chat in real-time, and share files.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB + Mongoose                |
| Real-time  | Socket.io                         |
| Auth       | JWT (Bearer token)                |
| Drag-Drop  | @hello-pangea/dnd                 |
| Icons      | Lucide React                      |

---

## Features

- **JWT Auth** — Register, login, profile, avatar upload, password change
- **Projects** — Create, browse, join (request/accept/reject), leave, delete
- **Kanban Board** — Drag-and-drop To Do / In Progress / Done, task priorities, assignees, due dates
- **Real-time Chat** — Socket.io per-project chat with typing indicators
- **File Uploads** — Upload any file type (50MB max), download, delete
- **Admin Panel** — Manage all users/projects, platform stats, role management
- **Dark/Light Mode** — System-wide theme toggle
- **Glassmorphism UI** — Deep navy base, electric blue + soft purple accents
- **Responsive** — Fully responsive, works on mobile/tablet/desktop

---

## Color Palette

| Token        | Value      |
|--------------|------------|
| Background   | `#0B0F1A`  |
| Cards        | `#121826`  |
| Primary      | `#3B82F6`  |
| Secondary    | `#8B5CF6`  |
| Text         | `#E5E7EB`  |
| Muted        | `#9CA3AF`  |
| Borders      | `#1F2937`  |
| Success      | `#10B981`  |
| Warning      | `#F59E0B`  |

---

## Getting Started

### 1. Clone and set up

```bash
git clone <repo-url>
cd collabxx
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabxx
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

## API Routes

### Auth
| Method | Route              | Description           |
|--------|--------------------|-----------------------|
| POST   | /api/auth/register | Register              |
| POST   | /api/auth/login    | Login                 |
| GET    | /api/auth/me       | Get current user      |
| PUT    | /api/auth/profile  | Update profile        |
| PUT    | /api/auth/password | Change password       |
| POST   | /api/auth/avatar   | Upload avatar         |

### Projects
| Method | Route                             | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | /api/projects                     | Browse public projects |
| GET    | /api/projects/my                  | My projects           |
| POST   | /api/projects                     | Create project        |
| GET    | /api/projects/:id                 | Get project           |
| PUT    | /api/projects/:id                 | Update project        |
| DELETE | /api/projects/:id                 | Delete project        |
| POST   | /api/projects/:id/join            | Request to join       |
| PUT    | /api/projects/:id/accept/:userId  | Accept member         |
| PUT    | /api/projects/:id/reject/:userId  | Reject member         |
| DELETE | /api/projects/:id/leave           | Leave project         |

### Tasks
| Method | Route                     | Description     |
|--------|---------------------------|-----------------|
| GET    | /api/tasks/project/:id    | Get tasks       |
| POST   | /api/tasks                | Create task     |
| PUT    | /api/tasks/:id            | Update task     |
| DELETE | /api/tasks/:id            | Delete task     |
| PUT    | /api/tasks/reorder/bulk   | Bulk reorder    |

### Messages
| Method | Route                      | Description      |
|--------|----------------------------|------------------|
| GET    | /api/messages/project/:id  | Get messages     |

### Files
| Method | Route                     | Description     |
|--------|---------------------------|-----------------|
| GET    | /api/files/project/:id    | Get files       |
| POST   | /api/files/project/:id    | Upload file     |
| DELETE | /api/files/:id            | Delete file     |

### Admin (requires admin role)
| Method | Route                  | Description       |
|--------|------------------------|-------------------|
| GET    | /api/admin/stats       | Platform stats    |
| GET    | /api/admin/users       | All users         |
| PUT    | /api/admin/users/:id   | Update user       |
| DELETE | /api/admin/users/:id   | Delete user       |
| GET    | /api/admin/projects    | All projects      |
| DELETE | /api/admin/projects/:id| Delete project    |

---

## Socket.io Events

| Event          | Direction        | Description              |
|----------------|------------------|--------------------------|
| project:join   | Client → Server  | Join a project room      |
| project:leave  | Client → Server  | Leave a project room     |
| message:send   | Client → Server  | Send a message           |
| message:new    | Server → Client  | New message received     |
| typing:start   | Client → Server  | User started typing      |
| typing:stop    | Client → Server  | User stopped typing      |
| user:online    | Server → Client  | User came online         |
| user:offline   | Server → Client  | User went offline        |

---

## Project Structure

```
collabxx/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          # User, Project, Task, Message, File
│   │   ├── middleware/       # auth, admin, upload
│   │   ├── routes/           # auth, projects, tasks, messages, files, admin
│   │   ├── socket/           # socketHandler.js
│   │   └── server.js
│   ├── uploads/              # auto-created
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/              # Axios API client
    │   ├── context/          # Auth, Theme, Socket contexts
    │   ├── components/
    │   │   ├── layout/       # Sidebar, Navbar, Layout
    │   │   ├── projects/     # ProjectCard, CreateModal, JoinRequests
    │   │   ├── kanban/       # KanbanBoard, Column, TaskCard, TaskModal
    │   │   ├── chat/         # ChatWindow
    │   │   ├── files/        # FileUpload, FileList
    │   │   └── ui/           # Badge, Avatar, Modal, ThemeToggle
    │   ├── pages/            # Landing, Login, Register, Dashboard, ProjectDetail, Profile, Admin
    │   └── main.jsx
    └── package.json
```

---

*Built with ❤️ — Together we build.*
