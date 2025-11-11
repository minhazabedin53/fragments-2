import Fragment from "../../src/model/fragment.js";
import { convertFragment } from "../../src/services/convert.js";

describe("convertFragment()", () => {
  test("converts a Markdown fragment to HTML", async () => {
    const fragment = new Fragment({
      ownerId: "user@example.com",
      type: "text/markdown",
      data: "# Hello\n\n**bold**",
    });
    await fragment.save();

    const result = await convertFragment(fragment.ownerId, fragment.id, "html");

    expect(result.type).toBe("text/html; charset=utf-8");
    const html = result.buffer.toString("utf8");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  test("throws 404 for missing fragment", async () => {
    await expect(
      convertFragment("user@example.com", "does-not-exist", "html"),
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  test("rejects non-markdown fragments with 415", async () => {
    const plain = new Fragment({
      ownerId: "user@example.com",
      type: "text/plain",
      data: "hello",
    });
    await plain.save();

    await expect(
      convertFragment(plain.ownerId, plain.id, "html"),
    ).rejects.toMatchObject({
      status: 415,
    });
  });

  test("rejects non-html target extensions with 415", async () => {
    const md = new Fragment({
      ownerId: "user@example.com",
      type: "text/markdown",
      data: "# Hello",
    });
    await md.save();

    await expect(
      convertFragment(md.ownerId, md.id, "txt"),
    ).rejects.toMatchObject({
      status: 415,
    });
  });
});
