const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./helper_test");
const app = require("../app");

const Blog = require("../models/blog");
const User = require("../models/user");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  helper.initialUser[0].passwordHash = await helper.ph();

  let newUser = new User(helper.initialUser[0]);
  await newUser.save();

  let noteObject = new Blog(helper.initialState[0]);
  await noteObject.save();

  noteObject = new Blog(helper.initialState[1]);
  await noteObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("unique identifier property of the blog posts must be id", async () => {
  const response = await api.get("/api/blogs");
  const keys = Object.keys(response.body[0]).map((key) => key);
  assert(keys.includes("id"));
});

test("blog creation fails if the token is not given", async () => {
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  };

  await api.post("/api/blogs").send(newBlog).expect(401);
});

test("a valid post can be added ", async () => {
  const userLogin = {
    username: helper.initialUser[0].username,
    password: helper.initialUser[0].password,
  };

  const res = await api.post("/api/login").send(userLogin).expect(200);

  const token = res.body.token;

  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${token}`)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  const contents = response.body.map((r) => r.title);

  assert.strictEqual(response.body.length, helper.initialState.length + 1);
  assert(contents.includes("First class tests"));
});

test("if field likes is missing must be 0", async () => {
  const userLogin = {
    username: helper.initialUser[0].username,
    password: helper.initialUser[0].password,
  };

  const resLog = await api.post("/api/login").send(userLogin).expect(200);

  const token = resLog.body.token;
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
  };

  const res = await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.body.likes, 0);
});

test("if data title or url is missing server must be response with 400", async () => {
  const userLogin = {
    username: helper.initialUser[0].username,
    password: helper.initialUser[0].password,
  };

  const resLog = await api.post("/api/login").send(userLogin).expect(200);

  const token = resLog.body.token;
  const newBlogWithoutTitle = {
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
  };
  const newBlogWithoutURL = {
    title: "First class tests",
    author: "Robert C. Martin",
  };

  await api
    .post("/api/blogs")
    .send(newBlogWithoutTitle)
    .set("Authorization", `Bearer ${token}`)
    .expect(400);
  await api
    .post("/api/blogs")
    .send(newBlogWithoutURL)
    .set("Authorization", `Bearer ${token}`)
    .expect(400);
});

test("delete blog succeeds with status code 204 if id is valid", async () => {
  const userLogin = {
    username: helper.initialUser[0].username,
    password: helper.initialUser[0].password,
  };

  const resLog = await api.post("/api/login").send(userLogin).expect(200);

  const token = resLog.body.token;

  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  const response = await api.get("/api/blogs");

  // const blogsAtStart = await helper.blogsInDb();
  const blogs = response.body;
  const blogToDelete = response.body[blogs.length - 1];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(blogsAtEnd.length, helper.initialState.length);
});

test("delete blog fails with statuscode 400 if id is invalid", async () => {
  const userLogin = {
    username: helper.initialUser[0].username,
    password: helper.initialUser[0].password,
  };

  const resLog = await api.post("/api/login").send(userLogin).expect(200);

  const token = resLog.body.token;
  const invalidId = "5a3d5da59070081a82a3445";

  await api
    .delete(`/api/blogs/${invalidId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(400);
});

test("update num of likes of blog with id", async () => {
  const userLogin = {
    username: helper.initialUser[0].username,
    password: helper.initialUser[0].password,
  };

  const resLog = await api.post("/api/login").send(userLogin).expect(200);

  const token = resLog.body.token;

  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  const res = await api.get("/api/blogs");

  const blogs = res.body;
  const blogToUpdate = res.body[blogs.length - 1];

  const likesToUpdate = 15;

  const blog = {
    ...blogToUpdate,
    likes: likesToUpdate,
  };

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blog)
    .set("Authorization", `Bearer ${token}`);

  const updatedBlog = response.body;

  assert.strictEqual(updatedBlog.likes, likesToUpdate);
});

after(async () => {
  await mongoose.connection.close();
});
