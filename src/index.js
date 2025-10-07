export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/upload" && req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file");
      const description = formData.get("description") || "";

      if (!file) return new Response("No file uploaded", { status: 400 });

      const filename = `${Date.now()}_${file.name}`;

      // 儲存至 R2
      await env.BUCKET.put(filename, file.stream());

      // 儲存檔案資訊至 D1
      await env.DB.prepare("INSERT INTO images (filename, description) VALUES (?, ?)")
        .bind(filename, description)
        .run();

      return new Response("File uploaded successfully");
    }

    if (url.pathname === "/images" && req.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM images ORDER BY uploaded_at DESC").all();
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/" && req.method === "GET") {
      const html = await env.ASSETS.fetch(req);
      return html;
    }

    return new Response("Not found", { status: 404 });
  },
};
