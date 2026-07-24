# CollabSpace — Project Documentation

> A complete spec for building pages in Lovable. Paste this entire file (or relevant sections) as context when prompting Lovable.

---

## 1. Product Overview

**CollabSpace** is a transparent, public-by-default collaboration platform for builders. Anyone can browse open projects, see who is working on what, and apply to join. Project owners review applications, accept/reject them, and the accepted members form a team workspace with chat, notes, and tasks.

**Core value proposition:** "Build in public. Find your team. Ship faster."

**Target audience:** Indie hackers, hackathon teams, students, open-source contributors, startup co-founders looking for collaborators.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-based theme, no `tailwind.config.ts`) |
| UI Components | shadcn/ui-style (Button, Card, Input, Textarea, Badge, Avatar, Dialog, Select) — all in `src/components/ui/` |
| Auth | Clerk v7 (email + OAuth) |
| Database | PostgreSQL via Prisma ORM v7 (uses `@prisma/adapter-pg`) |
| Realtime Chat | Supabase Realtime (postgres_changes on `Message` table) |
| File Uploads | Supabase Storage (avatars, attachments) |
| Cron Jobs | Vercel Cron (`/api/cron/*`) |
| Icons | `lucide-react` |
| Utils | `clsx`, `tailwind-merge`, `date-fns` optional |

**Lovable note:** If Lovable doesn't have Supabase Realtime or Prisma, you can mock these with `localStorage` and in-memory state for prototyping. The schema below is the source of truth for the data model.

---

## 3. Design System

### Color Palette (HSL)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-primary` | `hsl(239 84% 67%)` (Indigo-600) | same | CTAs, links, focus rings |
| `--color-background` | `hsl(0 0% 100%)` | `hsl(222.2 84% 4.9%)` | Page background |
| `--color-card` | `hsl(0 0% 100%)` | `hsl(222.2 84% 4.9%)` | Card background |
| `--color-foreground` | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` | Primary text |
| `--color-muted-foreground` | `hsl(215.4 16.3% 46.9%)` | `hsl(215 20.2% 65.1%)` | Secondary text |
| `--color-border` | `hsl(214.3 31.8% 91.4%)` | `hsl(217.2 32.6% 17.5%)` | Dividers, card borders |
| `--color-destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors, remove buttons |
| `--radius` | `0.75rem` | same | All rounded elements |

**Primary brand color is Indigo-600** (`bg-indigo-600`, `text-indigo-600`, `ring-indigo-600`).

### Typography
- **Font:** Inter (Google Fonts), fallback `system-ui, sans-serif`
- **Headings:** `text-2xl font-bold` (h1), `text-xl font-semibold` (h2), `text-lg font-semibold` (h3)
- **Body:** `text-sm` default, `text-xs` for metadata, `text-muted-foreground` for secondary text

### Spacing & Layout
- **Card padding:** `p-6`
- **Card border radius:** `rounded-xl` (12px)
- **Card border:** `border border-border bg-card`
- **Page max width:** `max-w-7xl mx-auto px-4`
- **Section spacing:** `space-y-6` (vertical), `gap-4` (grid)

### Component Patterns
- **Buttons:** `<Button>`, `<Button variant="outline">`, `<Button variant="ghost">`, `<Button variant="destructive">`, `<Button size="sm">`, `<Button size="icon">`
- **Cards:** `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`
- **Inputs:** `<Input>`, `<Textarea>`, `<Label>`
- **Badges:** `<Badge>`, `<Badge variant="secondary">`, `<Badge variant="outline">`
- **Avatars:** `<Avatar>`, `<AvatarImage>`, `<AvatarFallback>`, `<Avatar size="sm">` (32px), `size="md"` (40px), `size="lg"` (64px)

### Dark Mode
- Toggle via `class="dark"` on `<html>`
- All colors defined in CSS variables that swap automatically

---

## 4. Data Model (Prisma Schema)

```prisma
enum ProjectStatus { OPEN FULL ACTIVE COMPLETED CANCELLED }
enum AppStatus { PENDING ACCEPTED REJECTED EXPIRED }
enum TaskStatus { TODO IN_PROGRESS DONE }

model User {
  id            String    @id @default(cuid())
  clerkId       String    @unique
  name          String
  email         String    @unique
  avatar        String?
  bio           String?
  githubUrl     String?
  linkedinUrl   String?
  lastLoginAt   DateTime  @default(now())
  createdAt     DateTime  @default(now())
  skills        Skill[]
  domains       Domain[]
  projectsOwned Project[]      @relation("Owner")
  teams         TeamMember[]
  applications  Application[]
  notifications Notification[]
  messagesSent  Message[]
  notesCreated  Note[]
}

model Project {
  id               String        @id @default(cuid())
  title            String
  description      String
  problemStatement String
  requiredSkills   String[]
  teamSizeMax      Int           @default(5)
  status           ProjectStatus @default(OPEN)
  deadline         DateTime?
  isPrivate        Boolean       @default(false)
  inviteCode       String?       @unique
  ownerId          String
  owner            User          @relation("Owner", fields: [ownerId], references: [id])
  domain           String
  applications     Application[]
  team             TeamMember[]
  tasks            Task[]
  notes            Note[]
  messages         Message[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model Application {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  message   String
  status    AppStatus @default(PENDING)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])
  @@unique([userId, projectId])
}

model TeamMember {
  id            String    @id @default(cuid())
  userId        String
  projectId     String
  role          String    @default("member")
  joinedAt      DateTime  @default(now())
  removedAt     DateTime?
  removalReason String?
  user          User      @relation(fields: [userId], references: [id])
  project       Project   @relation(fields: [projectId], references: [id])
  @@unique([userId, projectId])
}

model Message {
  id        String   @id @default(cuid())
  content   String
  senderId  String
  projectId String
  createdAt DateTime @default(now())
  sender    User     @relation(fields: [senderId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])
}

model Note {
  id        String   @id @default(cuid())
  title     String
  content   String
  projectId String
  createdBy String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  project   Project   @relation(fields: [projectId], references: [id])
  author    User      @relation(fields: [createdBy], references: [id])
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  assignedTo  String?
  dueDate     DateTime?
  projectId   String
  createdAt   DateTime   @default(now())
  project     Project    @relation(fields: [projectId], references: [id])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // e.g. "application_accepted", "application_rejected", "new_message", "team_member_joined", "application_expired"
  message   String
  isRead    Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Skill { id String @id @default(cuid()) name String @unique users User[] }
model Domain { id String @id @default(cuid()) name String @unique users User[] }
```

### Key Relationships
- A **User** owns many **Projects** (via `ownerId`)
- A **Project** has many **Applications** (from users wanting to join)
- A **Project** has many **TeamMembers** (accepted applications become team)
- A **Project** has many **Messages** (chat), **Notes** (shared docs), **Tasks** (kanban)
- A **User** has many **Notifications** (in-app alerts)
- **Skills** and **Domains** are many-to-many tags on Users

---

## 5. Routes & Pages

### Public Routes
| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Hero + features + how it works + CTA |
| `/projects` | Discover | Browse/filter all open projects |
| `/sign-in` | Sign In | Clerk sign-in (email/OAuth) |
| `/sign-up` | Sign Up | Clerk sign-up |
| `/invite/[code]` | Invite Accept | Join project via invite code |
| `/api/webhooks/clerk` | Webhook | Sync Clerk users to DB |
| `/api/cron/*` | Cron | Auto-expire apps, archive dead projects |

### Protected Routes (require auth)
| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Your projects, applications, notifications |
| `/projects/new` | New Project | Create project form |
| `/projects/[id]` | Project Detail | View + apply + (if owner) manage |
| `/team/[id]` | Team Workspace | Chat + notes + tasks for project |
| `/profile/[id]` | User Profile | Public profile + skills + projects |
| `/notifications` | Notifications | Full notification list |
| `/api/teams/*` | Team API | Messages/notes/tasks CRUD |
| `/api/notifications/*` | Notification API | Mark read, fetch count |

---

## 6. Page-by-Page Specifications

### 6.1 Landing Page (`/`)
**Audience:** Unauthenticated visitors
**Goal:** Convert to sign-up

**Sections (top to bottom):**
1. **Navbar** — Logo "CollabSpace", links: Projects, Sign In, "Get Started" button
2. **Hero** — Headline: "Build in public. Find your team." Subheadline: "The transparent collaboration platform for builders. Browse open projects, apply to join, and ship together." Primary CTA: "Get Started" → `/sign-up`. Secondary: "Browse Projects" → `/projects`
3. **How It Works** — 3 steps in a row:
   - Step 1: "Discover" — Browse projects that match your skills
   - Step 2: "Apply" — Send a short application to join
   - Step 3: "Build" — Collaborate in a shared team workspace
4. **Features Grid** — 4 cards: Public by default, Real-time chat, Task kanban, Application tracking
5. **Final CTA** — "Ready to find your team?" + button
6. **Footer** — Minimal: © 2026 CollabSpace

**Component file:** `src/components/landing/landing-page.tsx`

---

### 6.2 Discover Page (`/projects`)
**Audience:** Anyone
**Goal:** Find a project to join

**Layout:**
- **Header:** Title "Discover Projects" + count
- **Filter bar (sticky):** Search input, Domain dropdown (Web, Mobile, AI/ML, etc.), Skill multi-select, Status (Open/Full/Active)
- **Grid:** 3 columns on desktop, 2 on tablet, 1 on mobile
- **Project Card:** Title, domain badge, owner avatar+name, description (3 lines max), skill tags, `teamSizeCurrent/teamSizeMax`, "View" button
- **Empty state:** "No projects yet. Be the first to create one." + CTA

**Data shape per card:**
```ts
{
  id, title, description, domain, requiredSkills: string[],
  teamSizeMax, status, createdAt,
  owner: { name, avatar },
  team: TeamMember[],  // length used for "current team size"
  _count: { applications: number }
}
```

**Component file:** `src/components/project/discover-page.tsx`

---

### 6.3 Project Detail (`/projects/[id]`)
**Audience:** Anyone (apply button only works for authenticated users)
**Goal:** Read project + apply

**Layout:**
- **Header:** Title (h1), domain badge, status badge, owner avatar+name+date, deadline if any
- **Action bar:** "Apply" button (opens modal) or "View Team Workspace" if accepted
- **Tabs or sections:**
  - **About:** Description (full), problem statement
  - **Required Skills:** Tag list
  - **Team (`teamSizeCurrent`/`teamSizeMax`):** Avatar grid of accepted members with roles
  - **Owner Health Badge:** "Active" (green), "Slow" (amber), "Ghost" (red) — computed from owner's `lastLoginAt` + last message date
  - **Applications:** Visible to owner only — list of pending apps with Accept/Reject buttons
  - **Share:** "Copy invite link" (only for private projects with `inviteCode`)

**Apply Modal:** Textarea for message (required, 50–500 chars), submit button. On submit, creates Application with `expiresAt = now + 7 days`.

**Component file:** `src/components/project/project-detail.tsx`

---

### 6.4 New Project (`/projects/new`)
**Audience:** Authenticated users
**Goal:** Create a project

**Form fields:**
- Title (required, 5–80 chars)
- Description (required, 50–1000 chars)
- Problem Statement (required, 50–500 chars) — "What problem are you solving?"
- Domain (required, select)
- Required Skills (required, multi-select with typeahead, 1–10)
- Team Size Max (required, number 2–10, default 5)
- Deadline (optional, date picker, must be future)
- Visibility: Public (default) or Private (toggles invite code generation)

**On submit:** Creates project, redirects to `/projects/[id]`.

**Component file:** `src/components/project/new-project-form.tsx`

---

### 6.5 Team Workspace (`/team/[id]`)
**Audience:** Only team members of that project
**Goal:** Collaborate

**Layout:** Three-panel tabs (top tabs):
- **Chat** — Real-time message list (Supabase Realtime subscription on `Message` table where `projectId = id`). Input at bottom. Shows sender avatar + name + time + content.
- **Notes** — List of notes (title + last edited). Click opens editor (title + content textarea, autosave on blur).
- **Tasks** — Kanban board with 3 columns: TODO, IN PROGRESS, DONE. Drag-and-drop cards (or buttons to move). Each card: title, assignee avatar, due date if any.

**Top bar:** Project title, link back to project detail, "Leave Team" button (with confirm).

**Component file:** `src/components/team/team-workspace.tsx` (uses `team-chat.tsx`, `team-notes.tsx`, `team-tasks.tsx`)

---

### 6.6 Dashboard (`/dashboard`)
**Audience:** Authenticated users
**Goal:** Overview of activity

**Sections:**
1. **Welcome:** "Hi {name}!" + stats (projects owned, apps pending, unread notifications)
2. **Your Projects:** Grid of projects you own (status, team count, applications count, "Manage" link)
3. **Your Applications:** List of projects you've applied to (status: Pending/Accepted/Rejected/Expired, project link)
4. **Recent Notifications:** Last 5 (full list link)

**Component file:** `src/components/dashboard/dashboard-page.tsx`

---

### 6.7 Profile (`/profile/[id]`)
**Audience:** Anyone
**Goal:** View user + their projects

**Layout:**
- **Header:** Large avatar, name, email, join date
- **Bio:** Paragraph
- **Social links:** GitHub, LinkedIn (icons)
- **Skills:** Tag list
- **Domains:** Tag list
- **Projects:** Grid of public projects they own (same card as discover)
- **Edit button:** Only visible if `id === currentUser.id` → links to `/profile/edit`

**Component file:** `src/components/profile/profile-page.tsx`

---

### 6.8 Notifications (`/notifications`)
**Audience:** Authenticated
**Goal:** See all alerts

**Layout:**
- Header: "Notifications" + "Mark all as read" button
- List (newest first): icon by type, message, timestamp, link if any, unread dot
- Empty state: "You're all caught up."

**Notification types & icons:**
- `application_accepted` → ✅ green
- `application_rejected` → ❌ red
- `new_message` → 💬 blue
- `team_member_joined` → 👋 purple
- `application_expired` → ⏰ amber

**Component file:** `src/components/notifications/notifications-page.tsx`

---

### 6.9 Sign In / Sign Up (`/sign-in`, `/sign-up`)
**Audience:** Unauthenticated
**Goal:** Sign in / register

**Layout:** Centered card with Clerk's `<SignIn />` / `<SignUp />` component. Below: "By continuing, you agree to our Terms" (text only, no real T&C).

**Fallback state:** If Clerk keys aren't configured, show: "Authentication not configured. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`."

---

## 7. UI Components Library (shadcn-style)

All components are in `src/components/ui/`. Each uses `cn()` from `@/lib/utils` and forwards refs.

### Button
```tsx
<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="secondary">Secondary</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus className="h-4 w-4" /></Button>
```
Variants: `default` (primary), `outline`, `ghost`, `destructive`, `secondary`. Sizes: `default` (h-10), `sm` (h-9), `lg` (h-11), `icon` (h-10 w-10).

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>
```

### Input / Textarea / Label
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
<Textarea placeholder="Tell us more..." rows={4} />
```

### Badge
```tsx
<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Web</Badge>
<Badge variant="destructive">Rejected</Badge>
```

### Avatar
```tsx
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
</Avatar>
```
Sizes: `sm` (h-8), `md` (h-10), `lg` (h-16).

### Select
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="web">Web</SelectItem>
    <SelectItem value="mobile">Mobile</SelectItem>
  </SelectContent>
</Select>
```

### Dialog
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Apply to Project</DialogTitle>
    </DialogHeader>
    {/* body */}
  </DialogContent>
</Dialog>
```

---

## 8. Server Actions & API Routes

### Server Actions (in `src/actions/`)
- `createProject(formData)` — Auth required, creates project owned by current user
- `applyToProject(projectId, message)` — Auth required, creates Application
- `updateApplicationStatus(appId, status)` — Owner only, ACCEPTED also creates TeamMember
- `removeTeamMember(memberId, reason)` — Owner only, sets `removedAt`
- `sendMessage(projectId, content)` — Team only, creates Message
- `createNote(projectId, title, content)` — Team only
- `updateTaskStatus(taskId, status)` — Team only

### API Routes (in `src/app/api/`)
- `POST /api/webhooks/clerk` — Svix-verified, creates/updates User
- `GET /api/teams/messages?projectId=X` — Team only, returns messages
- `POST /api/teams/messages` — Team only, body: `{projectId, content}`
- `GET/POST /api/teams/notes?projectId=X`
- `GET/POST/PATCH/DELETE /api/teams/tasks[/:id]?projectId=X`
- `GET /api/notifications` — Current user
- `PATCH /api/notifications/[id]/read` — Mark one read
- `PATCH /api/notifications/read-all` — Mark all read
- `GET /api/notifications/unread-count` — Returns `{count: number}`
- `GET /api/cron/expire-apps` — Sets PENDING apps past `expiresAt` to EXPIRED, notifies users
- `GET /api/cron/archive-inactive` — Sets projects with no messages in 30d to CANCELLED

---

## 9. Key Business Logic

### Application Lifecycle
1. User applies → `Application` created with `status=PENDING`, `expiresAt = now + 7 days`
2. Owner sees in project detail → Accept or Reject
3. **Accept:** `Application.status = ACCEPTED`, create `TeamMember` with `role="member"`, notify applicant
4. **Reject:** `Application.status = REJECTED`, notify applicant
5. **Expire (cron):** If still PENDING after 7 days → `EXPIRED`, notify user
6. **Unique constraint:** One application per user per project (`@@unique([userId, projectId])`)

### Project Status
- `OPEN` — Default, accepting applications
- `FULL` — `teamSizeCurrent >= teamSizeMax` (auto-set on accept)
- `ACTIVE` — Manual transition when team starts building
- `COMPLETED` — Project shipped
- `CANCELLED` — Auto-archived by cron after 30 days inactive, or manual

### Admin Health Badge
Computed on project detail:
- **Active** (green): Owner logged in within 7 days AND last message within 3 days
- **Slow** (amber): Owner logged in 7–14 days ago OR last message 3+ days ago
- **Ghost** (red): Owner logged in 14+ days ago

### Invite System
- Private projects auto-generate `inviteCode` (cuid) on creation
- Public projects: `isPrivate = false`, anyone can apply via Discover
- Private: only people with invite link can see + apply

---

## 10. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/collabspace

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cron security
CRON_SECRET=random-32-char-string
```

---

## 11. File Structure

```
src/
├── actions/
│   ├── project.ts
│   └── application.ts
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── projects/new/page.tsx
│   │   ├── projects/[id]/page.tsx
│   │   ├── team/[id]/page.tsx
│   │   ├── profile/[id]/page.tsx
│   │   └── notifications/page.tsx
│   ├── api/
│   │   ├── cron/{expire-apps,archive-inactive}/route.ts
│   │   ├── notifications/{route.ts, [id]/read/route.ts, read-all/route.ts, unread-count/route.ts}
│   │   ├── teams/{messages,notes,tasks,tasks/[id],members/[userId]}/route.ts
│   │   └── webhooks/clerk/route.ts
│   ├── invite/[code]/page.tsx
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                (Button, Card, Input, Badge, Avatar, Dialog, Select, etc.)
│   ├── layout/            (Navbar, Footer)
│   ├── landing/
│   ├── project/
│   ├── team/
│   ├── dashboard/
│   ├── profile/
│   ├── notifications/
│   └── auth/
└── lib/
    ├── prisma.ts          (Prisma client singleton)
    ├── supabase.ts        (Browser + server clients)
    ├── utils.ts           (cn, timeAgo, daysLeft, getHealthStatus)
    └── safe-db.ts         (Graceful DB error wrapper)
```

---

## 12. Build & Run

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev      # Uses --webpack flag (turbopack broken on this machine)
# or: npm run build && npm start
```

The `npm run dev` script uses `--webpack` because Turbopack's native binary (`@next/swc-win32-x64-msvc`) fails to load on this Windows x64 + Node v26 combo. Webpack fallback works perfectly.

---

## 13. Lovable-Specific Prompts

When asking Lovable to build a page, use this template:

> "Build the **[page name]** page for CollabSpace. Use the design system in this doc (Indigo-600 primary, shadcn components, Inter font, dark mode support). The page should [goal]. Mock the data with this shape: [TypeScript type from doc]. Use the project card component pattern: rounded-xl border, p-6, title + domain badge + owner avatar + description + skill tags + button."

### Quick page builds to ask for:
1. "Build the Discover page with filter bar and project card grid"
2. "Build the Project Detail page with apply modal and health badge"
3. "Build the Team Workspace with tabbed chat/notes/tasks"
4. "Build the Dashboard with stats and recent activity"
5. "Build the Notifications page with type-based icons"
6. "Build the Profile page with skills, domains, and project grid"
7. "Build the Landing page with hero, how-it-works, features, and CTA"

---

## 14. Current Status

✅ **Built and running on http://localhost:3000**
- 24 routes compiled, all pages return 200
- Graceful degradation: works without Clerk/DB configured
- Build: `npm run build` passes
- TypeScript: `npx tsc --noEmit --skipLibCheck` passes

**Next steps for the user:**
1. Set up real Clerk project (clerk.com)
2. Set up PostgreSQL database (Supabase/Neon/Railway)
3. Set up Supabase project for Realtime + Storage
4. Run `npx prisma migrate dev` to create tables
5. Configure webhook in Clerk dashboard pointing to `/api/webhooks/clerk`
6. Replace mock data in pages with real Prisma queries

---

## 15. Dependencies

```json
{
  "dependencies": {
    "next": "16.2.7",
    "react": "19.x",
    "react-dom": "19.x",
    "@clerk/nextjs": "^7",
    "@prisma/client": "^7",
    "@prisma/adapter-pg": "^7",
    "@supabase/supabase-js": "^2",
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-avatar": "latest"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "prisma": "^7",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "postcss": "^8",
    "svix": "latest"
  }
}
```

---

**That's the complete spec.** Paste this into Lovable as a project description, then prompt per page using section 13 as a template. Lovable will produce pixel-perfect pages that match the existing Next.js app.
