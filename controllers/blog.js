const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const middleware = require("../utils/middleware");

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  // console.log(blogs);
  response.json(blogs);
});

blogRouter.post("/", middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes, userId } = request.body;

  if (!title || !url) {
    return response.status(400).end();
  }

  const user = request.user;

  const newBlog = {
    title,
    author,
    url,
    likes: likes || 0,
    user: user.id,
  };

  const blog = new Blog(newBlog);
  const result = await blog.save();
  user.blogs = user.blogs.concat(result._id);
  await user.save();
  response.status(201).json(result);
});

blogRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const id = request.params.id;

    const user = request.user;

    const blog = await Blog.findById(id);

    if (user.id !== blog.user.toString()) return response.status(401).end();

    await Blog.findByIdAndDelete(id);
    response.status(204).end();
  }
);

blogRouter.put("/:id", middleware.userExtractor, async (request, response) => {
  const id = request.params.id;

  const user = request.user;

  const blog = await Blog.findById(id);

  if (user.id !== blog.user.toString()) return response.status(401).end();

  const { title, author, url, likes } = request.body;
  const newBlog = {
    title,
    author,
    likes,
    url,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, { new: true });
  response.json(updatedBlog);
});

module.exports = blogRouter;
