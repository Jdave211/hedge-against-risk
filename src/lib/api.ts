const API_URL = import.meta.env.VITE_API_URL;

export async function searchEvents(query: string) {
  const res = await fetch(`${API_URL}/v1/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search failed (${res.status}): ${text}`);
  }

  return res.json();
}
