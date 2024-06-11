const bcryptjs = require("bcryptjs");
const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./helper_test");
const app = require("../app");
const User = require("../models/user");

const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcryptjs.hash("sekret", 10);
    const user = new User({ name: "root", username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "root",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails if password does not have a length greater than 3", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "user1",
      name: "user1",
      password: "pa",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(
      result.body.error.includes("Password must be at least 3 characters")
    );

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails if password is not given", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "user1",
      name: "user1",
      password: "",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("Password is required"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails if username does not have a length greater than 3", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "us",
      name: "user1",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("User validation failed: username"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails if username is not given", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "",
      name: "user1",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("is required"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
