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
- [ ] True subdomain routing once aia-supportdesk.com is connected
- [ ] Self-service tenant registration flow
- [ ] Email notifications via GHL
- [ ] Customer reply to ticket feature
- [ ] Ticket search in admin panel
- [ ] Activity log per ticket

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
