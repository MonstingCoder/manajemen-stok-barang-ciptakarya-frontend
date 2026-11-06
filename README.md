# Cipta Karya — Inventory Management

Frontend for the `manajemen-stok-barang-ciptakarya-backend` API, built with Bun, React, TypeScript, Vite, and TanStack Router.

## Features

- Public landing page and email/password login through the backend.
- JWT-protected inventory routes; administrative navigation is based on the role in the JWT.
- List, search by name, paginate, create, update, and delete inventory items.
- Tag management (admins can create and delete tags; other users can view them).
- User administration (admins can list, update names/emails/passwords, and delete users).
- Personal account profile management (name, email, and password; users cannot change their own role).
- Filter inventory by a selected tag from the tags page or item tag chips.
- Responsive layout and Indonesian rupiah formatting.

The backend does not currently provide a role list, user registration through the UI, or a dedicated stock adjustment endpoint. Therefore, roles cannot be changed from the frontend, and stock quantities are updated through the item form. Item search on the backend matches names exactly.

## Run locally

Make sure the API and PostgreSQL backend are running. From the frontend directory:

```sh
cp .env.example .env
bun install
bun run dev
```

The default API URL is `http://localhost:8080`. Set `VITE_API_URL` in `.env` if the backend is hosted elsewhere. The backend must also allow the frontend origin through `ALLOWED_ORIGINS` (the backend default is `http://localhost:5173`).

## Type-check, lint, and build

```sh
bun run typecheck
bun run lint
bun run build
```

The production build is written to `dist/`. Run it locally with `bun run preview`.

## Routes

- `/` — public landing page.
- `/login` — sign in.
- `/app/items` — inventory.
- `/app` — shortcut to the inventory dashboard.
- `/app/tags` — tags.
- `/app/tags/:tagId/items` — items associated with the selected tag.
- `/app/account` — profile for the signed-in user.
- `/app/users` — user administration (admin only).

The authentication token is stored in `localStorage` and sent in the authorization bearer header. The backend remains the source of truth for authentication and access control.

The account page reads `/users/me` and sends only changed profile fields to `PATCH /users/{id}`; users cannot change their role from the account page. Select a tag on the tags page or in the inventory to view its items through the backend endpoint `GET /tags/{name}/items?limit=50&offset=0`.
