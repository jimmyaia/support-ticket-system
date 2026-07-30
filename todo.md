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
