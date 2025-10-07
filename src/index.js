export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/todos" && request.method === "GET") {
      // 取得所有代辦事項
      const { results } = await env.DB.prepare("SELECT * FROM todos").all();
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/todos" && request.method === "POST") {
      // 新增代辦事項
      const { task } = await request.json();
      if (!task) {
        return new Response("Missing task", { status: 400 });
      }
      await env.DB
        .prepare("INSERT INTO todos (task, done) VALUES (?, ?)")
        .bind(task, 0)
        .run();
      return new Response("Created", { status: 201 });
    }

    return new Response("Not found", { status: 404 });
  },
};
