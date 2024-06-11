const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");
const blogs = require("../utils/data");

describe("author with most likes", () => {
  test("find the author with most likes in total", () => {
    const res = listHelper.mostLikes(blogs);
    const expect = {
      author: "Edsger W. Dijkstra",
      likes: 17,
    };
    assert.deepStrictEqual(res, expect);
  });
});
