

export default async function typedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed with status ${res.status} for URL ${url} with response: ${await res.text()}`);
  return res.json();
}