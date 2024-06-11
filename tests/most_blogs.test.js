const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");
const blogs = require("../utils/data");

describe("author with most blogs", () => {
  test("find the author with most post", () => {
    const res = listHelper.mostBlogs(blogs);
    const expect = {
      author: "Robert C. Martin",
      blogs: 3,
    };
    assert.deepStrictEqual(res, expect);
  });
});
