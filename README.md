# Blogging API

A RESTful blogging API built with **Express.js**, **MongoDB**, and **JWT authentication**.  
Testing is done with **Jest** and **Supertest**.

---

## Setup

### Clone the repository

```sh
git clone https://github.com/odeh-simon/blogging-api.git
cd blogging-api
```

### Install dependencies

```sh
npm install
```

### Create a `.env` file in the root directory and add:

```
PORT=your-desired-port (e.g. 3000)
MONGODB_URL=Dev-mongodb-instance
MONGODB_TEST_URL=low-memory-test-database-url-for-testing
JWT_SECRET=your_jwt_secret_key
```

---

### Start the server

```sh
npm start
```

**Or for development with hot reload:**

```sh
npm run dev
```

---

### Run tests

```sh
npm test
```

---

## Endpoints

### Auth

- `POST /api/v1/auth/signup` — Register a new user  
- `POST /api/v1/auth/signin` — Login a user  

### Blogs

- `GET /api/v1/blogs` — Get all published blogs (paginated, searchable, sortable)  
- `GET /api/v1/blogs/:id` — Get a single published blog  
- `GET /api/v1/blogs/drafts` — Get all drafts (requires auth, owner only)  
- `POST /api/v1/blogs` — Create a new blog (requires auth)  
- `GET /api/v1/blogs/my-blogs` — Get user's blogs (requires auth)  
- `PUT /api/v1/blogs/:id` — Update a blog (requires auth, owner only)  
- `DELETE /api/v1/blogs/:id` — Delete a blog (requires auth, owner only)  

---

## Query Parameters

- `page`: Page number (default: 1)  
- `limit`: Blogs per page (default: 20)  
- `state`: Filter by state (`draft`/`published`, default: `draft`)  
- `author`: Search by author name (case-insensitive)  
- `title`: Search by title (case-insensitive)  
- `tags`: Search by tags (comma-separated)  
- `sort`: Sort by field (e.g., `read_count:desc`, `timestamp:asc`)  

---

## Reading Time

Calculated as `ceil(word_count / 200)` minutes, assuming 200 words per minute reading speed.

---

## NOTE

To perform the tests, comment out the `connectToMongoDb` function call in `server.js` to avoid connecting two different MongoDB instances at the same time,  
or simply use the `MONGODB_URL` from the `.env` file in the test files instead of the `MONGODB_TEST_URL`.  
Make sure to set up your `.env` file with the appropriate values for `PORT`, `JWT_SECRET`, `MONGODB_URL`, and/or `MONGODB_TEST_URL`.