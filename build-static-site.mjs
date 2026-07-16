import { mkdir, readFile, writeFile } from "node:fs/promises";

const files = {
  "index.html": await readFile("index.html", "utf8"),
  "styles.css": await readFile("styles.css", "utf8"),
  "game.js": await readFile("game.js", "utf8")
};

const worker = `const files = ${JSON.stringify(files)};

const contentTypes = {
  "index.html": "text/html; charset=utf-8",
  "styles.css": "text/css; charset=utf-8",
  "game.js": "text/javascript; charset=utf-8"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let path = decodeURIComponent(url.pathname);

    if (path === "/" || path === "") {
      path = "/index.html";
    }

    const key = path.replace(/^\\//, "");
    const body = files[key];

    if (!body) {
      return new Response(files["index.html"], {
        headers: {
          "content-type": contentTypes["index.html"],
          "cache-control": "no-store"
        }
      });
    }

    return new Response(body, {
      headers: {
        "content-type": contentTypes[key] || "application/octet-stream",
        "cache-control": "no-store"
      }
    });
  }
};
`;

await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", worker);
