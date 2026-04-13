const API = "https://localhost:44352/api";

export const api = {
  get: (url: string) => fetch(`${API}${url}`).then(r => r.json()),

  post: (url: string, body: undefined) =>
    fetch(`${API}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
};