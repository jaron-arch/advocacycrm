# Customer Advocacy CRM

A purpose-built internal web app for tracking customer advocacy relationships — accounts, contacts, activity logs, community memberships, and willingness-to-help tags. Built with Next.js 14, Prisma, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router, Server Actions) |
| Database ORM | Prisma 5 |
| Database | PostgreSQL |
| Styling | Tailwind CSS 3 |
| Language | TypeScript 5 |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd advocacy-crm
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and fill in your DATABASE_URL
```

Your `DATABASE_URL` should look like:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### 3. Run migrations & seed

```bash
npm run db:generate     # generate Prisma client
npm run db:migrate      # run database migrations
npm run db:seed         # seed default activity types, communities, etc.
```

### 4. Start the dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add `DATABASE_URL` as an environment variable (pointing to your production Postgres)
4. Deploy

After first deploy, run migrations against production:
```bash
DATABASE_URL="<production-url>" npx prisma migrate deploy
DATABASE_URL="<production-url>" npx tsx prisma/seed.ts
```

### Railway

1. Create a new Railway project
2. Add a PostgreSQL service — Railway provides the `DATABASE_URL` automatically
3. Add a web service pointing to your repo
4. Set `BUILD_COMMAND` to `npm run build` and `START_COMMAND` to `npm start`

### Render

1. Create a Render account and a new Web Service
2. Add a PostgreSQL database (Render provides the connection string)
3. Set `DATABASE_URL` in your environment variables
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

---

## Project Structure

```
src/
├── app/
│   ├── actions.ts              # All server actions (create/update/delete)
│   ├── layout.tsx              # Root layout with Navigation
│   ├── page.tsx                # Redirects to /accounts
│   ├── accounts/
│   │   ├── page.tsx            # Accounts list with search, filters, advocacy grid
│   │   ├── new/page.tsx        # Create account
│   │   └── [id]/
│   │       ├── page.tsx        # Account detail (contacts, summary, activities rollup)
│   │       └── edit/page.tsx   # Edit account
│   ├── contacts/
│   │   ├── page.tsx            # Contacts list with advanced filters
│   │   ├── new/page.tsx        # Create contact
│   │   └── [id]/
│   │       ├── page.tsx        # Contact detail (activity log, tags, communities)
│   │       └── edit/page.tsx   # Edit contact
│   ├── activities/
│   │   └── new/page.tsx        # Log new activity
│   └── settings/
│       └── page.tsx            # Manage configurable picklists
├── components/
│   ├── Navigation.tsx          # Top nav
│   ├── AccountForm.tsx         # Create/edit account form
│   ├── ContactForm.tsx         # Create/edit contact form
│   ├── ActivityForm.tsx        # Log activity form
│   ├── SettingsSection.tsx     # Inline settings editor
│   ├── CheckboxGroup.tsx       # Multi-select checkboxes
│   └── DeleteButton.tsx        # Confirm + delete button
└── lib/
    └── prisma.ts               # Singleton Prisma client
```

---

## Data Model

| Entity | Key Fields |
|--------|-----------|
| **Account** | name, companySize, industry, productsUsed[], npsScore, internalOwner, notes, salesforceId |
| **Contact** | firstName, lastName, email, jobTitle, accountId, communities[], willingnessTags[], notes, salesforceId |
| **Activity** | contactId, activityTypeId, date, title, notes, loggedBy |
| **ActivityType** | name, slug, archived (configurable) |
| **Community** | name, archived (configurable) |
| **WillingnessTag** | name, archived (configurable) |
| **Industry** | name, archived (configurable) |
| **Product** | name, archived (configurable) |

---

## Key Features

### Accounts list with advocacy summary grid
The main accounts view shows a table with one column per activity type, displaying ✓ or — to indicate whether any contact at that account has completed that activity type.

### Advanced contact search
The Contacts page supports combining filters: "contacts in Beta Program who are open to case studies but haven't done one yet" — use the **Willing to** + **Has NOT done** filters together.

### Configurable picklists
All enum fields (activity types, communities, industries, products, willingness tags) are managed in Settings without code changes.

### Salesforce-ready data model
Accounts and Contacts include optional `salesforceId` fields for future bidirectional sync.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate:dev` | Create and apply a new migration (dev) |
| `npm run db:migrate` | Apply existing migrations (production) |
| `npm run db:seed` | Seed default configuration values |
| `npm run db:reset` | Reset DB and re-seed (⚠️ destroys all data) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## Roadmap (V2+)

- Multi-user auth with Admin / Editor / Viewer roles
- Salesforce bidirectional sync
- Reporting dashboards (engagement depth, activity trends, untapped advocates)
- Email/Slack reminders for stale advocates
- CSV import for bulk data migration
- Bulk actions (tag multiple contacts at once)
- Audit log

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required) |
