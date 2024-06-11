const Blog = require("../models/blog");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");

const initialState = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
];

const ph = async () => {
  const saltRounds = 10;
  const passwordHash = await bcryptjs.hash("user123", saltRounds);
  return passwordHash;
};

const initialUser = [
  {
    username: "user1",
    name: "user1",
    passwordHash: null,
    password: "user123",
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  });
  // return users.map((user) => user.toJSON());
  return users;
};

module.exports = { initialState, blogsInDb, usersInDb, initialUser, ph };
