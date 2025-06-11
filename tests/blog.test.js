const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

let token;
let userId;
let blogId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URL);
  server = app.listen(0);
  const signup = await request(app)
    .post('/api/v1/auth/signup')
    .send({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'password123',
    });
  token = signup.body.token;
  userId = signup.body.data.user.id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Blog API', () => {
  it('should create a blog (draft)', async () => {
    const res = await request(app)
      .post('/api/v1/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog',
        description: 'Test Description',
        tags: ['test, testing'],
        author: 'Simon', 
        body: 'This is a test blog content.',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.blog.state).toBe('draft');
    expect(res.body.data.blog.author).toBe('Simon');
    expect(res.body.data.blog.owner).toBe(userId);
    blogId = res.body.data.blog._id;
  });

  it('should get published blogs (public)', async () => {
    await Blog.create({
      title: 'Published Blog',
      body: 'Content',
      author: 'Jane Doe',
      owner: userId,
      state: 'published',
    });
    const res = await request(app).get('/api/v1/blogs?state=published');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.blogs.length).toBeGreaterThan(0);
  });

  it('should not allow state=draft in getAllBlogs', async () => {
    const res = await request(app).get('/api/v1/blogs?state=draft');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid state value. Only "published" blogs can be queried here. Use /drafts for draft blogs.');
  });

  it('should get draft blogs for owner via /drafts', async () => {
    await Blog.create({
      title: 'Draft Blog',
      body: 'Content',
      author: 'John Doe',
      owner: userId,
      state: 'draft',
    });
    const res = await request(app)
      .get('/api/v1/blogs/drafts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.blogs[0].state).toBe('draft');
  });

  it('should not allow unauthenticated access to /drafts', async () => {
    const res = await request(app).get('/api/v1/blogs/drafts');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });

  it('should get blogs by author name', async () => {
    await Blog.create({
      title: 'Simon’s Blog',
      body: 'Content',
      author: 'Simon Odeh',
      owner: userId,
      state: 'published',
    });
    const res = await request(app).get('/api/v1/blogs?author=Simon');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.blogs[0].author).toBe('Simon Odeh');
  });

  it('should update blog state to published', async () => {
    const res = await request(app)
      .put(`/api/v1/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ state: 'published', author: 'New Author' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.blog.state).toBe('published');
    expect(res.body.data.blog.author).toBe('New Author');
  });

  it('should increment read_count when getting a blog', async () => {
    const res = await request(app).get(`/api/v1/blogs/${blogId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.blog.read_count).toBe(1);
  });

  it('should get my blogs (filtered by state)', async () => {
    const res = await request(app)
      .get('/api/v1/blogs/my-blogs?state=published')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.blogs[0].state).toBe('published');
  });

  it('should delete a blog', async () => {
    const res = await request(app)
      .delete(`/api/v1/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  it('should not allow non-owner to update blog', async () => {
    const otherUser = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        first_name: 'Other',
        last_name: 'User',
        email: 'other@example.com',
        password: 'password123',
      });
    const blog = await Blog.create({
      title: 'Another Blog',
      body: 'Content',
      author: 'Another Author',
      owner: otherUser.body.data.user.id,
    });
    const res = await request(app)
      .put(`/api/v1/blogs/${blog._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });
    expect(res.statusCode).toBe(403);
  });
});