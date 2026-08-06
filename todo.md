# Support Ticket System — TODO

## Database & Backend
- [x] Add tickets table (id, ticketNumber, name, email, subject, description, priority, status, assigneeId, imageUrl, loomUrl, createdAt, updatedAt, resolvedAt)
- [x] Add ticket_notes table (id, ticketId, authorId, content, createdAt)
- [x] Add ticket_attachments table
- [x] Run drizzle migration and apply SQL
- [x] tRPC: tickets.submit (public) — generate ticket number, create ticket
- [x] tRPC: tickets.lookup (public) — look up ticket by number, return public fields only
- [x] tRPC: tickets.list (admin/staff) — list all tickets with filters/sort
- [x] tRPC: tickets.getById (admin/staff) — full ticket detail with notes and assignee
- [x] tRPC: tickets.updateStatus (admin/staff) — update ticket status
- [x] tRPC: tickets.assign (admin/staff) — assign ticket to staff member
- [x] tRPC: tickets.addNote (admin/staff) — add internal note to ticket
- [x] tRPC: staff.list (admin/staff) — list all staff members
- [x] tRPC: staff.updateRole (admin) — change user role
- [x] tRPC: reports.monthly (admin/staff) — monthly volume, status breakdown, completion rate, avg time-to-resolve
- [x] tRPC: reports.volume (admin/staff) — 6-month bar chart data

## Public Pages
- [x] Public landing / home page with CTA to submit ticket and check status
- [x] Ticket submission form (name, email, subject, description, priority, image upload, Loom URL)
- [x] Ticket submitted confirmation page showing generated ticket number
- [x] Ticket status lookup page (enter ticket number → view status + public updates)

## Admin / Staff Area
- [x] Admin dashboard layout with sidebar navigation
- [x] Ticket list view with filter (status, priority) and sort (date)
- [x] Ticket detail view with full info, status update, assignee selector, and notes
- [x] Internal notes panel — add/view timestamped notes (staff only)
- [x] Staff management page (list staff, assign roles)
- [x] Reporting page (monthly volume chart, status breakdown, completion rate, avg time-to-resolve)
- [x] Role-based access control (admin vs staff vs unauthenticated)

## Design & Polish
- [x] Elegant design system: Inter + Playfair Display fonts, slate/indigo palette, refined shadows
- [x] Responsive layout for all pages
- [x] Empty states and loading skeletons
- [x] Toast notifications for all actions

## Tests
- [x] Vitest: ticket status lookup (NOT_FOUND for invalid ticket)
- [x] Vitest: role-based access — tickets.list rejects unauthenticated and regular users
- [x] Vitest: role-based access — tickets.addNote rejects unauthenticated and regular users
- [x] Vitest: role-based access — staff.updateRole rejects non-admin staff
- [x] Vitest: auth.logout clears session cookie (8 tests total, all passing)

## Standalone Email/Password Auth Migration
- [x] Add passwordHash column to users table, make openId nullable, add email unique constraint
- [x] Add bcrypt password hashing; implement register, login, logout tRPC procedures
- [x] Replace Manus OAuth context/sdk with JWT session from email/password login
- [x] Replace OAuth callback route with email/password login/register API routes
- [x] Build Login page and Register page on frontend
- [x] Update useAuth hook to redirect to /login instead of startLogin()
- [x] Update AdminLayout to link to /login instead of startLogin()
- [x] Update main.tsx to redirect to /login on UNAUTHORIZED errors
- [x] Seed jimmy@aibizstrategist.com as admin with hashed password
- [x] Update tests for new auth system

## Multi-Tenant SaaS Architecture
- [x] Add tenants, tenant_products, webhook_logs tables; add tenantId to users and tickets
- [x] Seed second super admin: jimmy@onetouch.media (password: !99Rykalyn)
- [x] Tenant tRPC router: list, getById, create, update, toggleActive, delete, product CRUD, webhookLogs, testWebhook, getBySlug
- [x] GHL webhook engine (server/ghlWebhook.ts): fires on ticket.submitted, ticket.status_changed, ticket.assigned
- [x] All ticket/staff/reports routers scoped to tenantId
- [x] Super admin panel: /superadmin overview, /superadmin/tenants list, /superadmin/tenants/new create, /superadmin/tenants/:id detail
- [x] TenantDetail with 4 tabs: Settings, GHL Integration (webhook URL, API key, event toggles, test button, payload reference), Product Dropdown, Webhook Logs
- [x] Super Admin link in AdminLayout sidebar (visible to admin users with no tenantId)
- [x] Landing page updated to $149/month with AIA SupportDesk branding

## Phase 6 — Per-Tenant Portal
- [x] SubmitTicket: dynamic product loading via trpc.tickets.getProducts when tenantId param provided; falls back to GoHighLevel/Amply for tenantId=0
- [x] tenants.getMyTenant procedure: tenant admins can read their own tenant info
- [x] tenants.updateMyTenant procedure: tenant admins can update company name and logo
- [x] /admin/settings page: tenant branding (name, logo) + product dropdown editor for tenant admins
- [x] AdminLayout: Settings nav item visible to tenant admins (role=admin with tenantId)

## Pending / Future Work
- [x] Fill in DEMO_CALENDAR_URL in Home.tsx (https://api.leadconnectorhq.com/widget/bookings/jimmys-master-calendar)
- [x] Set/Change Password feature for all admin users (/admin/profile page)
- [x] Super Admin: View as Tenant (impersonation) — startImpersonation/exitImpersonation/impersonationStatus tRPC procedures, amber banner in AdminLayout, "View as Tenant" button in TenantDetail
- [x] Super Admin: Global ticket search across all tenants — searchTicketsGlobal tRPC procedure, /superadmin/search page, Global Search nav item in SuperAdminLayout
- [x] Editable slug field in TenantDetail Settings tab with live URL preview
- [x] CreateTenant form: auto-format slug input and live URL preview
- [x] Fixed OneTouch Media slug from 'onetouch-media' to 'onetouch' (deleted duplicate tenant ID 1)
- [ ] Stripe paywall ($149/mo subscription before registration)
- [ ] Path-based tenant routing (/t/:slug/) for demo before domain connection
- [x] True subdomain routing once aia-supportdesk.com is connected — live via Cloudflare Worker
- [ ] Self-service tenant registration flow
- [x] Email notifications via GHL — implemented in tickets router (sendGhlEmail/sendGhlSms on status change and ticket submit)
- [x] Customer reply to ticket — removed from scope (handled in GoHighLevel)
- [x] Ticket search in admin panel — server-side LIKE on ticket#/subject/name/email, debounced input, filter chips, assignee name display
- [x] Activity log per ticket — timestamped timeline in ticket detail (ticket.created, status.changed, assignee.changed, note.added)

## Security & Code Quality
- [x] Remove dead code: unused ComponentShowcase route, DashboardLayout OAuth startLogin reference, unused useRouter import
- [x] Remove orphaned OAuth startLogin function from client/src/const.ts
- [x] Add helmet security headers to Express server
- [x] Add rate limiting: auth (10/15min), ticket submit (20/10min), file upload (10/10min), general API (300/min)
- [x] Tighten body size limits from 50MB to 1MB JSON
- [x] Add MIME type validation on file upload endpoint (images only)
- [x] Shorten JWT session from 1 year to 7 days
- [x] Add password strength requirements (uppercase + number) on registration
- [x] Add max length to description (10000) and note content (10000) fields
- [x] Set Express trust proxy=1 for correct IP detection behind Manus load balancer
- [x] Security & code audit: removed unused imports (getTenantProducts, getUserById from tenants.ts; Badge/CardDescription from GlobalSearch.tsx), deleted dead ComponentShowcase.tsx (1437 lines), added tenant-scoping guard to staff.listAll and staff.updateRole, fixed hardcoded domain in TenantDetail webhook preview
- [x] Company admin: add staff users (first name, last name, email, password, role) directly from admin Staff page
- [x] Company admin: remove staff users from their tenant
- [x] Second audit pass: removed unused imports (useEffect, Badge, refetch from CheckStatus.tsx), fixed indented import blocks in tenants.ts and staff.ts (was causing stale esbuild error), removed orphaned updateTicketImageUrl function from db.ts, replaced all hardcoded aia-supportdesk.com domain references with window.location.origin/tenantId URLs across TenantDetail, CreateTenant, TenantList, Overview, TenantSettings
- [x] TenantBranding component in AdminLayout header (company logo + name for tenant admins)
- [x] Public portal branding: SubmitTicket and CheckStatus show "Welcome to [Company Name] Support" via getTenantInfo tRPC procedure
- [x] Global Staff management page in Super Admin (/superadmin/staff)
- [x] Third audit pass: fixed TenantPortal.tsx syntax error (stray import lines after closing brace), removed unused imports across 11 files (Smartphone from Home.tsx, Separator from TenantSettings.tsx, currentUser/attachments/assignee from TicketDetail.tsx, Button from Tickets.tsx, useState/Separator/Globe/Key/Lock from CreateTenant.tsx, CardHeader/CardTitle/formatDistanceToNow from Overview.tsx, useForm/Clock/ExternalLink/AlertTriangle/format from TenantDetail.tsx, CardHeader/CardTitle from TenantList.tsx, ROOT_DOMAINS from useSubdomain.ts, LOCAL_HOSTS/isIpAddress from cookies.ts). TypeScript: 0 errors | Tests: 14/14 passing
- [x] Fourth audit pass: replaced (undefined as any) initializers with "" in TenantDetail.tsx ghlForm state, removed all (tenant as any) casts for ghlField*/ghlSend*/ghlLocationId (all are on the Tenant type), added 2 vitest tests for getTenantInfoBySlug. TypeScript: 0 errors | Tests: 16/16 passing

## Subdomain-Based Multi-Tenant Routing
- [x] Add getTenantBySlug public tRPC procedure (returns name, logoUrl, id, isActive)
- [x] Add getBySlugPublic public tRPC procedure to tickets router for slug-based tenant lookup
- [x] Add subdomain detection hook (useSubdomain) on frontend — reads slug from window.location.hostname
- [x] Create TenantPortal page (/): when on slug subdomain, renders SubmitTicket branded for that tenant
- [x] Create TenantStatus page (/status): when on slug subdomain, renders CheckStatus for that tenant
- [x] Update App.tsx routing to detect subdomain and serve portal/status pages at root
- [x] Add getTenantInfoBySlug and getProductsBySlug public tRPC procedures
- [x] Update GHL webhook buildStatusPageUrl to use slug.aia-supportdesk.com format
- [x] Update all admin UI tenant URL displays to show slug.aia-supportdesk.com
- [x] Update CreateTenant portal URL preview to show slug.aia-supportdesk.com (live preview as slug is typed)
- [x] Update TenantDetail portal URL to show slug.aia-supportdesk.com
- [x] Update TenantList portal URL to show slug.aia-supportdesk.com
- [x] Update TenantSettings portal URL to show slug.aia-supportdesk.com
- [x] Handle unknown subdomain: friendly error page with redirect to aia-supportdesk.com
- [x] Add vitest: getTenantInfoBySlug returns null for unknown slug + correct shape for valid slug (2 tests, 16/16 passing)
- [x] Cloudflare wildcard DNS record (* CNAME cname.manus.space) — done (see Domain & Cloudflare Setup)
- [x] Wildcard subdomain routing handled via Cloudflare Worker proxy (no Manus domain panel needed)

## Domain & Cloudflare Setup
- [x] Cloudflare nameservers set in Bluehost
- [x] Cloudflare wildcard DNS record (* CNAME cname.manus.space) — done
- [x] Cloudflare Worker deployed (aiasupportdesk-proxy) — proxies *.aia-supportdesk.com to Manus app
- [x] Worker route set: *.aia-supportdesk.com/* → aiasupportdesk-proxy
- [x] useSubdomain hook bug fixed — now correctly detects slug from hostname
- [x] TicketConfirmation updated to link to /status on subdomains vs /check-status on root
- [x] Add screenshot image upload (drag-and-drop area, 5 MB limit, presigned S3 PUT) and Loom video URL field to TenantPortal.tsx (subdomain portal form). Added getUploadUrl public tRPC procedure to tickets router.

## GHL Integration
- [x] GHL API service (server/ghl.ts): contact upsert (email→phone→create), opportunity create/update, send email/SMS, pipeline listing, custom fields builder
- [x] Per-tenant GHL config: API key, location ID, pipeline ID, stage mapping (new/in-progress/stuck/completed/closed), email/SMS toggles, custom field keys
- [x] Ticket submit: creates GHL contact + opportunity with custom fields (ticket number, description, priority, product, status, ticket URL, Loom URL)
- [x] Status change: updates GHL opportunity stage + sends email/SMS notification via GHL
- [x] GHL Integration tab in Super Admin → Tenants → [Tenant]: API key, location ID, pipeline/stage mapping, notification toggles, custom field key inputs
- [x] Custom field keys persist correctly — controlled state synced from DB via useEffect on load
- [x] Save Custom Field Keys button works independently (no longer requires API key/location ID in form state)
- [x] GHL pipeline fetch: loads live pipelines from GHL API into stage dropdowns
- [ ] End-to-end GHL test: submit ticket → verify contact + opportunity created in GHL sub-account

## Mobile Responsiveness

- [x] AdminLayout: collapsible mobile sidebar with hamburger menu and overlay drawer
- [x] Admin Tickets list: responsive table → card layout on mobile
- [x] Admin TicketDetail: stack sidebar below main content on mobile
- [x] Admin Dashboard: responsive stat cards and charts
- [x] Admin Staff page: stack member rows and fix 2-col dialog form on mobile
- [x] Admin Reports: horizontal scroll for tables, responsive charts
- [x] Public Home page: fix nav overflow, compress hero spacing on mobile
- [x] Public submit form: already mostly OK, minor padding tweaks
- [x] ClickUp → SupportDesk status sync: when a ClickUp task is closed/completed, fire a webhook to our system and auto-update the linked ticket status to "completed"

## ClickUp Direct Integration Roadmap
### What this does (plain English)
Right now ClickUp gets tickets from GHL, but the task names are messy (just contact names) and there are no details inside the tasks. This roadmap connects AIA SupportDesk DIRECTLY to ClickUp — so every ticket automatically creates a perfectly formatted ClickUp task with the ticket number, full description, customer info, images, and a link back to the ticket. Each client (tenant) connects their own ClickUp during onboarding.

### Step 1 — Add ClickUp fields to tenant settings (database)
- [x] Add two new fields to the tenants table in the database: `clickupApiKey` (the client's ClickUp API token) and `clickupListId` (the ID of the list where support tasks should land)
- [x] Run the database migration so the new fields are saved
- [x] These fields work just like the GHL API key — each tenant has their own

### Step 2 — Add ClickUp config to the Super Admin tenant settings page
- [x] In Super Admin → Tenants → [Tenant], add a new "ClickUp Integration" tab (same style as the GHL tab)
- [x] Add two input fields: "ClickUp API Key" and "ClickUp List ID"
- [x] Add a "Test Connection" button that checks if the API key and list ID are valid
- [x] Add a "Save ClickUp Settings" button
- [x] Show a green checkmark if connected, red X if not

### Step 3 — Build the ClickUp task creator (server code)
- [x] Create a new file `server/clickup.ts` that handles all ClickUp API calls
- [x] Write a `createClickUpTask` function that takes ticket data and creates a task
- [x] Task name format: `[TKT-XXXXX] Subject line here — Customer Name`
  - Example: `[TKT-MSDHEQ6C-8DQ] my automation has a miss spelling — aia sd testing2`
- [x] Task description format (all the details inside the task):
  - Ticket Number: TKT-XXXXX
  - Customer Name and Email
  - Priority (Low / Medium / High / Urgent)
  - Product/Department
  - Subject
  - Full description text
  - Image link (if customer uploaded one)
  - Loom video link (if customer added one)
  - Direct link to the ticket in SupportDesk: https://[slug].aia-supportdesk.com/admin/tickets/[id]
- [x] Map SupportDesk priority to ClickUp priority (urgent=1, high=2, medium=3, low=4)
- [x] Map SupportDesk priority to ClickUp priority (urgent=1, high=2, medium=3, low=4)
- [x] Log success or failure so we can see it in production logs

### Step 4 — Wire ClickUp task creation into ticket submit
- [x] When a ticket is submitted, AFTER the GHL contact/opportunity is created, also call `createClickUpTask`
- [x] Only fire if the tenant has a ClickUp API key and List ID configured (skip silently if not set up)
- [x] If ClickUp creation fails, log the error but do NOT block the ticket from being created — the ticket still saves, GHL still fires, ClickUp failure is just logged
- [x] Store the resulting ClickUp task ID on the ticket (`clickupTaskId` field) so we can link back to it later

### Step 5 — Show ClickUp task link in ticket detail
- [x] In the admin ticket detail page, if a ClickUp task ID exists, show a "View in ClickUp" button that opens the task directly
- [x] This lets support staff jump from SupportDesk to ClickUp with one click

### Step 6 — ClickUp → SupportDesk status sync (close the loop)
- [x] Create a public webhook endpoint in our system: `POST /api/webhooks/clickup`
- [x] When ClickUp marks a task as complete, it fires this webhook
- [x] Our system reads the ClickUp task ID, finds the matching ticket, and automatically updates the ticket status to "completed" with the completion timestamp
- [x] Log the webhook event in the activity log: "Ticket completed via ClickUp by [assignee name]"
- [x] Tenant must paste our webhook URL into their ClickUp workspace settings during onboarding

### Step 7 — Add ClickUp setup to the onboarding checklist
- [x] Update the tenant onboarding flow (or onboarding documentation) to include:
  1. Generate ClickUp API token (ClickUp → Settings → Apps → API Token)
  2. Find your ClickUp List ID (open the list in ClickUp, copy the number from the URL)
  3. Paste both into SupportDesk → Super Admin → Tenants → [Tenant] → ClickUp Integration tab
  4. Click Test Connection to confirm it works
  5. Paste the SupportDesk webhook URL into ClickUp workspace settings
- [x] Remove the old GHL → ClickUp automation in GHL once this is working (avoids duplicate tasks)

### Step 8 — Test the full flow end-to-end
- [x] Submit a test ticket on a tenant portal
- [x] Verify: ticket created in SupportDesk ✓
- [x] Verify: GHL contact + opportunity created ✓
- [x] Verify: ClickUp task created with correct name format and full description ✓
- [x] Verify: ClickUp task has correct priority ✓
- [x] Verify: "View in ClickUp" button appears in ticket detail ✓
- [x] Mark the ClickUp task complete → verify ticket auto-updates to "completed" in SupportDesk ✓

## Code Audit — Aug 2026

### Orphaned / Abandoned Files Removed
- [x] Deleted `client/src/components/AIChatBox.tsx` — template leftover, never imported or used
- [x] Deleted `client/src/components/ManusDialog.tsx` — OAuth dialog template, replaced by email/password auth
- [x] Deleted `client/src/components/Map.tsx` — Google Maps template, not relevant to support desk
- [x] Deleted `client/src/components/DashboardLayout.tsx` — replaced by AdminLayout; was never imported
- [x] Deleted `client/src/components/DashboardLayoutSkeleton.tsx` — only used by DashboardLayout (also deleted)
- [x] Deleted `server/_core/voiceTranscription.ts` — template helper, not used anywhere in this project
- [x] Deleted `server/_core/llm.ts` — template helper, not used anywhere in this project

### Dead Code Removed
- [x] Removed `getActivity` tRPC procedure from tickets router — dead; `getById` already returns activity in its response, so this was a duplicate never called by the frontend

### todo.md Corrections
- [x] Marked all ClickUp Steps 3–8 items as complete (task name format, description format, priority mapping, Step 6 webhook sync, Step 7 onboarding, Step 8 testing — all implemented)
- [x] Duplicate priority mapping entry (one `[ ]` and one `[x]` for the same item) cleaned up

### Remaining Pending Work (Future)
- [ ] Stripe paywall ($149/mo subscription before registration)
- [ ] Path-based tenant routing (/t/:slug/) for demo before domain connection
- [ ] Self-service tenant registration flow
- [ ] Drag-to-reorder product dropdown (GripVertical icon is present but drag logic not wired)
