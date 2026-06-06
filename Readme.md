```markdown
# 🏛️ Wisdomly OS

**Enterprise Multi-Tenant School Management Platform** An ultra-premium, high-performance operating system for modern educational institutions. Engineered for scale with a distributed monorepo architecture and designed with a top 0.1% spatial UI paradigm.

---

## 🛠 Tech Stack Core

* **Framework:** Next.js 14 (App Router) & Express.js
* **Architecture:** Turborepo (pnpm workspaces)
* **Database & ORM:** Neon Serverless Postgres & Prisma
* **Styling & Motion:** Tailwind CSS, Framer Motion (Spring Physics)
* **Spatial UI:** React Three Fiber (WebGL), Three.js
* **Icons:** Lucide React

---

## 🗺 Architecture Topology Map

Wisdomly OS enforces a strict separation of functional business logic from presentational rendering. All state, API requests, and routing logic are isolated in custom hooks to ensure the core engine can be seamlessly shared with future React Native mobile applications.

```text
wisdomly/
├── apps/
│   ├── web/                     # Next.js 14 Frontend Client
│   │   ├── src/
│   │   │   ├── app/             # Pure Presentational/Aesthetic Routes
│   │   │   ├── components/      # UI Layer (Framer Motion, GSAP, WebGL)
│   │   │   └── hooks/           # Isolated Functional Brains (e.g., useLogin.ts)
│   └── api/                     # Express.js Core Backend Engine
├── packages/
│   ├── db/                      # Database Shared Workspace
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Single-Source-of-Truth Neon Schema
│   │   │   └── seed.ts          # Master Demo Database Provisioner
│   └── config/                  # Shared ESLint/TypeScript configs
├── pnpm-workspace.yaml          # Monorepo workspace definitions
└── package.json
# 🏛️ Wisdomly OS

**Enterprise Multi-Tenant School Management Platform** An ultra-premium, high-performance operating system for modern educational institutions. Engineered for scale with a distributed monorepo architecture and designed with a top 0.1% spatial UI paradigm.

---

## 🛠 Tech Stack Core

* **Framework:** Next.js 14 (App Router) & Express.js
* **Architecture:** Turborepo (pnpm workspaces)
* **Database & ORM:** Neon Serverless Postgres & Prisma
* **Styling & Motion:** Tailwind CSS, Framer Motion (Spring Physics)
* **Spatial UI:** React Three Fiber (WebGL), Three.js
* **Icons:** Lucide React

---

## 🗺 Architecture Topology Map

Wisdomly OS enforces a strict separation of functional business logic from presentational rendering. All state, API requests, and routing logic are isolated in custom hooks to ensure the core engine can be seamlessly shared with future React Native mobile applications.

```text
wisdomly/
├── apps/
│   ├── web/                     # Next.js 14 Frontend Client
│   │   ├── src/
│   │   │   ├── app/             # Pure Presentational/Aesthetic Routes
│   │   │   ├── components/      # UI Layer (Framer Motion, GSAP, WebGL)
│   │   │   └── hooks/           # Isolated Functional Brains (e.g., useLogin.ts)
│   └── api/                     # Express.js Core Backend Engine
├── packages/
│   ├── db/                      # Database Shared Workspace
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Single-Source-of-Truth Neon Schema
│   │   │   └── seed.ts          # Master Demo Database Provisioner
│   └── config/                  # Shared ESLint/TypeScript configs
├── pnpm-workspace.yaml          # Monorepo workspace definitions
└── package.json

```

---

## 🚀 Quick-Start Local Protocol (From Clone to Dev)

Follow these exact steps to spin up the distributed workspace locally.

### Prerequisites

* Node.js (v18.x or higher)
* `pnpm` installed globally (`npm install -g pnpm`)
* Git

### 1. Clone the Repository

```bash
git clone [https://github.com/your-org/wisdomly.git](https://github.com/your-org/wisdomly.git)
cd wisdomly

```

### 2. Install Dependencies

Initialize the monorepo and install all cross-workspace dependencies.

```bash
pnpm install

```

### 3. Environment Configuration

Create the necessary `.env` files in their respective workspaces.

**Database (`packages/db/.env`):**

```env
DATABASE_URL="postgresql://[your-neon-user]:[your-neon-password]@[your-neon-host]/wisdomly?sslmode=require"

```

**Backend (`apps/api/.env`):**

```env
PORT=4000
JWT_SECRET="your-high-entropy-jwt-secret-key"
DATABASE_URL="postgresql://[your-neon-user]:[your-neon-password]@[your-neon-host]/wisdomly?sslmode=require"

```

**Frontend (`apps/web/.env.local`):**

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

```

### 4. Database Schema Synchronization

Push the Prisma schema to your local/developer Neon database branch.

```bash
pnpm --filter @wisdomly/db prisma db push

```

### 5. Provision the Master Dataset

Inject the baseline multi-tenant demo data required to test the application.

```bash
pnpm --filter @wisdomly/db prisma db seed

```

### 6. Ignite the Development Server

Start the Next.js frontend and Express backend concurrently.

```bash
pnpm dev

```

* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:4000`
* **Prisma Studio (DB Viewer):** `pnpm --filter @wisdomly/db prisma studio`

---

## 🔐 Seeding & Development Matrix

The seed script provisions a default workspace (`greenvalley-school`). Use the following real-time profiles to test cross-role isolation boundaries:

| Scope | Identity | Workspace Domain | Security Key |
| --- | --- | --- | --- |
| **Administrator** | `admin@greenvalley.edu` | `greenvalley-school` | `Welcome@123` |
| **Teacher** | `vikram@greenvalley.edu` | `greenvalley-school` | `Welcome@123` |
| **Student** | `live.tester1@greenvalley.edu` | `greenvalley-school` | `Welcome@123` |

---

## 🛡 Engineering Quality & Production Hardening Checklist

Before submitting a Pull Request, developers must satisfy the following protection criteria:

1. **Strict Logic Isolation:** Inline state mutations or bare fetch actions inside UI route files (`page.tsx`) are strictly prohibited. All logic **must** be abstracted into decoupled hooks (e.g., `useLogin.ts`, `useStudentData.ts`).
2. **Defensive Error Handling:** Never trust frontend parameters exclusively. Validate inputs comprehensively at the API gate. Implement safe fallback states, elegant loading skeletons, and readable user error dialogs on the frontend.
3. **Multi-Tenant Isolation:** Enforce deep validation checking on tenant parameters (`schoolId` or `schoolSlug`) during every database transaction to block lateral cross-tenant data leaks.
4. **Performance Architecture:** Utilize cursor-based data pagination for massive datasets, compress dynamic web media, and ensure Prisma queries selectively map columns rather than executing bulk table downloads.

---

## 🎨 High-End UI Tokens & Animation Protocols (Top 0.1% Standard)

Wisdomly OS rejects generic, predictable layouts. The visual character of the system relies on spatial depth, fluid physics, and intentional typography.

* **Typography Hierarchy:** We enforce a strict separation of `Instrument Serif` for high-end display headings and `DM Sans` for functional, highly-legible interface data.
* **Spatial Glassmorphism:** Our interface panels utilize layered, multi-stop translucent materials.
```css
/* Example Premium Glass Token */
backdrop-filter: blur(40px) saturate(2);
background: rgba(20, 18, 16, 0.65);
box-shadow: 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);

```


* **Kinetic Momentum:** Basic linear CSS transitions are banned for primary interactions. Use hardware-accelerated spring dynamics (via Framer Motion) for fluid momentum on hover states, layout morphs (`layoutId`), and route transitions.
* **WebGL Integration:** High-impact routes (like authentication and main dashboards) leverage subtle `@react-three/fiber` canvases to create deep, interactive ambient backgrounds.

```

```