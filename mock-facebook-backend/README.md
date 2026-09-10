# Mock Facebook REST API Backend

A clean, modular REST API server built with **Node.js, Express, TypeScript, and Prisma ORM with local SQLite persistence**. It provides a complete backend for Facebook mock web applications and browser extension / plugin testing, featuring real-time outbound webhook event dispatching.

---

## 1. Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation & Setup

```bash
cd mock-facebook-backend

# 1. Install dependencies
npm install

# 2. Push Prisma schema to SQLite (creates dev.db)
npx prisma db push

# 3. Seed database with 6 mock users, 10 rich posts, reactions, and comments
npm run seed

# 4. Start the server in watch mode
npm run dev
```

The API server will run at **`http://localhost:4000`**.

---

## 2. Environment Configuration (`.env`)

```env
PORT=4000
DATABASE_URL="file:./dev.db"

# Third-party webhook recipient for reaction and comment events
THIRD_PARTY_API_URL="https://httpbin.org/post"

# Optional Bearer token or authorization key sent in headers
THIRD_PARTY_API_KEY="your_api_key_here"
```

---

## 3. Database Schema

- **`User`**: `id`, `name`, `avatarUrl`, `handle`, `createdAt`.
- **`Post`**: `id`, `authorId`, `content`, `mediaUrl` (nullable), `createdAt`, `updatedAt`.
- **`Reaction`**: `id`, `postId`, `userId`, `type` (`LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`), `createdAt`. Unique constraint on `[postId, userId]`.
- **`Comment`**: `id`, `postId`, `authorId`, `text`, `createdAt`.
- **`WebhookLog`**: `id`, `eventType`, `payload`, `responseStatus`, `error`, `timestamp`.

---

## 4. REST API Reference

### Feed & Posts
- **`GET /api/posts`**
  - Query parameters: `page` (default: 1), `limit` (default: 10)
  - Returns paginated posts with author profile, total reactions, reactions breakdown by type, total comments, and latest 3 comments.
- **`POST /api/posts`**
  - Body: `{ "authorId": "user-me", "content": "Hello world!", "mediaUrl": "https://..." }`
  - Creates a new post.
- **`GET /api/posts/:id`**
  - Fetches an individual post with complete list of reactions and all comments.

### Reactions
- **`POST /api/posts/:id/reactions`**
  - Body: `{ "userId": "user-me", "type": "LOVE" }`
  - Valid types: `LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`.
  - Upserts reaction (one reaction per user per post) and triggers outbound webhook `post.reaction_updated`.
- **`DELETE /api/posts/:id/reactions`**
  - Body or Query: `userId=user-me`
  - Removes user's reaction and triggers outbound webhook `post.reaction_updated`.

### Comments
- **`GET /api/posts/:id/comments`**
  - Returns all comments for a post ordered by creation time.
- **`POST /api/posts/:id/comments`**
  - Body: `{ "authorId": "user-me", "text": "Awesome shot!" }`
  - Creates comment and triggers outbound webhook `post.comment_created`.

### Debug & Testing Utilities
- **`POST /api/debug/reset`**
  - Drops existing data and reseeds database with 10 rich posts, users, reactions, and comments.
- **`GET /api/debug/webhooks`**
  - Returns audit logs of all outbound webhook events sent to `THIRD_PARTY_API_URL`.
- **`GET /api/debug/users`**
  - Lists all seeded user IDs and profiles.

---

## 5. Third-Party Forwarding Engine (Webhooks)

When a reaction or comment is added or updated, the backend asynchronously dispatches an outbound event to `THIRD_PARTY_API_URL` without blocking the client's HTTP response.

### Payload: `post.reaction_updated`
```json
{
  "event": "post.reaction_updated",
  "timestamp": "2026-09-10T00:30:00.000Z",
  "data": {
    "postId": "post-1",
    "userId": "user-me",
    "reactionType": "LOVE",
    "totalReactions": 4
  }
}
```

### Payload: `post.comment_created`
```json
{
  "event": "post.comment_created",
  "timestamp": "2026-09-10T00:30:00.000Z",
  "data": {
    "postId": "post-1",
    "commentId": "...",
    "author": {
      "id": "user-me",
      "name": "Alex Mercer"
    },
    "text": "Great insights!",
    "totalComments": 4
  }
}
```

Delivery diagnostics, HTTP response codes, and network errors are automatically logged to the `WebhookLog` database table and inspectable via `GET /api/debug/webhooks`.

---

## 6. Browser Extension Integration (CORS)

The server's CORS middleware is explicitly configured to accept:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `chrome-extension://*` (Any injected content script or background service worker)
- All dev/tunnel origins.
