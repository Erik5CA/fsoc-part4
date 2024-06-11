var _ = require("lodash");
// const blogs = require("./data");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const total = blogs.reduce((acc, item) => (acc += item.likes), 0);
  return total;
};

const favoriteBlog = (blogs) => {
  const max = Math.max(...blogs.map((blog) => blog.likes));
  const blogFound = blogs.find((blog) => blog.likes == max);
  return {
    title: blogFound.title,
    author: blogFound.author,
    likes: blogFound.likes,
  };
};

const mostBlogs = (blogs) => {
  const res = _.countBy(blogs, "author");
  const objs = Object.entries(res).map(([key, value]) => {
    return {
      author: key,
      blogs: value,
    };
  });
  const authorWithMostBlogs = _.maxBy(objs, "blogs");
  return authorWithMostBlogs;
};

const mostLikes = (blogs) => {
  const res = _.groupBy(blogs, "author");
  const objs = Object.entries(res).map(([key, value]) => {
    return {
      author: key,
      likes: value.reduce((acc, item) => (acc += item.likes), 0),
    };
  });
  const authorWithMostLikes = _.maxBy(objs, "likes");
  return authorWithMostLikes;
};

// console.log(mostLikes(blogs));

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
