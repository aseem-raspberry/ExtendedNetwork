# Gotaavalaa — Personal Network Graph

Gotaavalaa is a private, collaborative **Personal Network Graph** (PNG) application that lets you map, visualise and explore the web of people, institutions, organisations and places in your life. Think of it as a living, interactive relationship map that you own and control.

---

## Why Gotaavalaa?

Most people maintain hundreds of meaningful connections — college friends, colleagues, family, mentors, neighbours — but all that context lives scattered across address books and social feeds you don't control. Gotaavalaa gives you a single, private canvas to:

- **See the big picture** — Visualise how contacts relate to each other across jobs, cities, universities and social circles.
- **Remember context** — Attach bios, categories (Family / Friend / Colleague) and custom relationship types so you never forget how you know someone.
- **Explore on demand** — Click the **＋** button on any node to lazily expand its neighbourhood from the database, keeping the canvas clean until you need more detail.
- **Collaborate** — Each authenticated user gets their own isolated *tree*, so multiple people can run their own graphs on the same deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI / Graph** | [React Flow (`@xyflow/react`)](https://reactflow.dev) with custom node types |
| **Physics** | [d3-force](https://github.com/d3/d3-force) (charge + link + collision simulation) |
| **Database** | [Neo4j](https://neo4j.com) via the official `neo4j-driver` |
| **Auth** | [NextAuth.js](https://next-auth.js.org) (session-based, multi-user) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Icons** | [Lucide React](https://lucide.dev) |

---

## Architecture Overview

```
app/
├── api/
│   ├── auth/[...nextauth]/   # NextAuth catch-all route
│   └── graph/
│       ├── nodes/             # GET — fetch nodes (optionally expand a node's neighbourhood)
│       ├── seed/              # POST — create the initial "You" node for a new tree
│       └── link/              # POST — add a connection between two entities
├── layout.tsx                 # Root layout with SessionWrapper
├── page.tsx                   # Main page — auth gate → seed form → graph canvas
└── globals.css

components/
├── GraphCanvas.jsx            # React Flow canvas with force layout, filtering, expand-on-click
├── NodeTypes.jsx              # Custom node renderers: Person, Institution, Organization, Place
├── NodeInspector.jsx          # Side-panel for viewing node details + adding connections
├── SidebarFilters.jsx         # Toggle visibility of entity categories
└── SessionWrapper.tsx         # NextAuth SessionProvider wrapper

hooks/
└── useGotaavalaaForce.js      # Hook that wires d3-force simulation → React Flow node positions

lib/
└── neo4j.js                   # Singleton Neo4j driver (reads credentials from env vars)
```

**Key design decisions:**

- **Data isolation** — Every query is scoped to the authenticated user's `treeId`, so users on the same Neo4j instance never see each other's data.
- **Lazy expansion** — Only the root neighbourhood is loaded initially; clicking the **＋** button fetches and merges adjacent nodes/edges into the canvas, keeping performance snappy.
- **Session-based layout** — The physics simulation runs client-side and restarts when the node/edge counts change. Node positions are *not* persisted so the graph re-arranges itself naturally each session.
- **MERGE semantics** — The API uses Neo4j `MERGE` instead of `CREATE` to prevent duplicate entities when the same person/place is added from different connections.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js ≥ 18** | Required by Next.js 16. Use [nvm](https://github.com/nvm-sh/nvm) if you need to manage versions. |
| **npm** (or yarn / pnpm / bun) | Comes with Node. The lockfile uses npm. |
| **Neo4j 5+** | A running Neo4j instance (local via [Neo4j Desktop](https://neo4j.com/download/) or cloud via [AuraDB Free](https://neo4j.com/cloud/aura-free/)). |
| **OAuth provider credentials** | NextAuth needs at least one provider configured (e.g. Google, GitHub). |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ExtendedNetwork.git
cd ExtendedNetwork
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# ── Neo4j ────────────────────────────────────────
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password

# ── NextAuth ─────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a-random-secret-string   # generate one: openssl rand -base64 32

# ── OAuth Provider (example: Google) ─────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> **Tip:** If you're using AuraDB, the `NEO4J_URI` will start with `neo4j+s://` instead of `bolt://`.

### 4. Start Neo4j

Make sure your Neo4j instance is running and accessible at the URI specified above. No manual schema setup is needed — the app uses `MERGE` queries that create labels and relationships on the fly.

### 5. Run the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. You'll be prompted to sign in, after which you can seed your personal graph and start building your network.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot-reload |
| `npm run build` | Create an optimised production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the codebase |

---

## Usage

1. **Sign in** — Authenticate via your configured OAuth provider to create or access your tree.
2. **Seed your graph** — On first login you'll fill out a short profile (name, bio, college, city) that becomes the root node of your network.
3. **Explore** — The graph canvas renders your network with a physics-based layout. Drag and zoom freely.
4. **Filter** — Use the sidebar toggles to show / hide entity types (People, Institutions, Organisations, Places).
5. **Inspect** — Click any node to open the inspector panel with full details.
6. **Expand** — Hit the **＋** button on a node to pull in its connected neighbours from the database.
7. **Connect** — From the inspector, add new connections by specifying a target entity and relationship type.

---

## Entity Types & Relationships

### Node Labels

| Label | Colour | Description |
|---|---|---|
| **Person** | 🔵 Blue (default) / 🟢 Green (Family) / 🟠 Orange (Friend) | People in your network |
| **Institution** | ⚫ Slate | Universities, schools, hospitals, etc. |
| **Organization** | 🟣 Purple | Companies, NGOs, clubs, etc. |
| **Place** | 🟡 Yellow | Cities, towns, countries |

### Example Relationship Types

`FRIEND_OF` · `FAMILY_OF` · `COLLEAGUE_OF` · `STUDIED_AT` · `WORKED_AT` · `LIVES_IN` · `BORN_IN`

You can define any relationship type you like — just type it in when adding a connection.

---

## Deployment

The quickest way to deploy is with [Vercel](https://vercel.com):

1. Push your repo to GitHub.
2. Import it into Vercel.
3. Add the environment variables from `.env.local` in the Vercel dashboard.
4. Deploy.

Alternatively, run `npm run build && npm run start` on any Node.js-capable host.

---

## License

This is a private project. Add a license file if you plan to open-source it.
