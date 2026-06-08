---
name: code-optimization
description: Use this skill when optimizing code for performance, readability, maintainability, scalability, handover quality, refactoring, reducing duplication, improving database/API efficiency, and making the project easier for another developer or client team to maintain.
---

# Code Optimization & Maintainability Skill

Use this skill whenever the task involves:
- Optimizing application performance
- Refactoring messy code
- Reducing duplicated code
- Improving readability
- Improving project structure
- Making the code easier to maintain by other developers
- Preparing the project for client handover
- Cleaning frontend, backend, API, database, or utility logic

## Main Goal

The goal is not only to make the code shorter.

The goal is to make the application:
- Faster
- More efficient
- Easier to read
- Easier to debug
- Easier to extend
- Safer to maintain
- More stable for production/client usage

## Core Rules

1. Do not change business behavior unless explicitly requested.
2. Do not remove existing features.
3. Do not rename files or routes randomly.
4. Do not rewrite everything from scratch unless necessary.
5. Prefer small, safe, reviewable improvements.
6. Keep the code understandable for future developers.
7. Avoid over-engineering.
8. Avoid clever code that is hard to understand.
9. After optimization, explain what changed and why.
10. Always mention possible risks or areas that need manual testing.

## Optimization Priorities

Prioritize improvements in this order:

1. Correctness
   - The feature must still work.
   - Existing business rules must remain valid.

2. Readability
   - Clear names for variables, functions, components, and files.
   - Avoid confusing logic.
   - Split long functions when helpful.
   - Add comments only when logic is not obvious.

3. Maintainability
   - Reduce duplicate code.
   - Extract reusable helpers/components.
   - Group related logic properly.
   - Keep API/database/frontend responsibilities separated.

4. Performance
   - Avoid unnecessary loops.
   - Avoid repeated expensive calculations.
   - Avoid unnecessary re-renders.
   - Avoid fetching too much data.
   - Avoid duplicate database queries.
   - Use pagination/filtering when data can grow large.

5. Scalability
   - Make sure the code can handle more users, branches, modules, and data.
   - Avoid hardcoded values when they should be configurable.

6. Handover Quality
   - Code must be understandable by another developer.
   - Important flows should be documented.
   - Commands for running, testing, and building should be clear.

## Frontend Optimization Rules

For React / Next.js frontend:

- Extract repeated UI into reusable components.
- Avoid huge page files with too much logic.
- Keep components focused.
- Use clear prop names.
- Avoid unnecessary client components.
- Avoid unnecessary state.
- Avoid duplicated mapping/filtering logic.
- Keep form validation clear.
- Keep loading, empty, and error states consistent.
- Make table/list rendering efficient.
- Keep UI logic separate from business/data logic where possible.

When optimizing UI:
- Do not break the existing design.
- Do not make the UI look generic.
- Preserve accessibility and readability.
- Make spacing, typography, and status display consistent.

## Backend / API Optimization Rules

For API routes and server logic:

- Validate input on the server.
- Avoid trusting frontend-only validation.
- Avoid duplicate validation logic where possible.
- Return clear error messages.
- Avoid returning unnecessary fields.
- Avoid repeated database calls.
- Keep API response shape consistent.
- Keep business rules centralized when possible.

## Database / Prisma Optimization Rules

For Prisma and PostgreSQL:

- Avoid unnecessary full-table reads.
- Use `where`, `select`, `include`, `orderBy`, `take`, and `skip` properly.
- Use pagination for large data lists.
- Add unique constraints or indexes only when justified.
- Do not change schema without explaining migration impact.
- Preserve existing data.
- Be careful with delete/update operations.
- For unique business fields like Nomor TLS, enforce uniqueness at database level if appropriate.

## BARKAS+ Project Rules

This project includes:
- Sparepart
- Barang Bekas
- SGA

Important business rules:
- SGA uses Nomor TLS as the unique identifier.
- Do not create separate Kode SGA.
- Duplicate Nomor TLS must be rejected with a clear notification.
- Satuan is not needed for SGA because it is sold as borongan.
- Admin Pusat can access all branches.
- Cabang users should only access allowed branch data.
- Sold items should not be edited into invalid status.
- Do not break role-based access.

## Refactoring Rules

When refactoring:

1. First understand the existing flow.
2. Identify duplicate code.
3. Identify confusing naming.
4. Identify unnecessary complexity.
5. Refactor gradually.
6. Keep behavior the same.
7. Run tests after changes.
8. Explain the before/after improvement.

Good refactor examples:
- Extract repeated cards into `SummaryCard`.
- Extract status badge into `StatusBadge`.
- Extract repeated formatters into `formatCurrency`, `formatDate`, or `formatWeight`.
- Extract repeated table actions into reusable components.
- Move business validation into shared helper/service.
- Replace duplicated filters with a single reusable function.

Bad refactor examples:
- Rewriting the whole page without reason.
- Changing database schema without need.
- Changing UI and business logic at the same time without explanation.
- Making abstraction too complicated.
- Removing readable code just to make it shorter.

## Testing & Verification

After optimization, check:

- App still builds.
- Main feature still works.
- Existing tests still pass.
- No TypeScript errors.
- No obvious UI break.
- No role access regression.
- No data loss risk.

Recommended commands:

```bash
npm run test
npm run build
npm run lint
npx prisma generate