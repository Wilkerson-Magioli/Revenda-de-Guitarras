// Cliente de API (fetch) com base URL do .env
const RAW = (import.meta as any).env?.VITE_API_URL as string | undefined;
// remove barra final se tiver (evita //guitarras)
const API_URL = (RAW ?? "http://localhost:3000").replace(/\/+$/, "");

type Options = RequestInit & { auth?: boolean };

function makeUrl(path: string, method?: string) {
  const base = `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  if ((method ?? "GET").toUpperCase() === "GET") {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}ts=${Date.now()}`;
  }
  return base;
}

function pickAuthToken() {
  const admin = localStorage.getItem("admin_token");
  if (admin) return admin;
  const cliente = localStorage.getItem("cliente_token");
  if (cliente) return cliente;
  const generic = localStorage.getItem("token");
  return generic ?? "";
}

async function request<T>(
  path: string,
  { auth, headers, ...init }: Options = {}
): Promise<T> {
  const method = (init.method ?? "GET").toString().toUpperCase();
  const url = makeUrl(path, method);

  const h: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  if (auth) {
    const token = pickAuthToken();
    if (token) (h as any)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
      ...h,
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  // Se por engano bater no Vite (5173), virá HTML (<!DOCTYPE ...>)
  if (text && (text.startsWith("<!DOCTYPE") || text.startsWith("<html"))) {
    throw new Error(
      `A URL ${url} retornou HTML. Verifique VITE_API_URL no .env e se o caminho "${path}" existe no back-end.`
    );
  }

  // Parse JSON mesmo sem content-type correto, quando o corpo "parece" JSON
  let data: unknown = null;
  if (text) {
    const looksJson = /^[\s]*[\[{]/.test(text);
    const isJsonHeader = /application\/json/i.test(contentType);
    if (isJsonHeader || looksJson) {
      try {
        data = JSON.parse(text);
      } catch {
        // mantém data = null se não der para parsear
      }
    }
  }

  if (!res.ok) {
    const msg =
      (data as any)?.error ||
      (data as any)?.message ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return (data as T) ?? (null as T);
}

export const api = {
  url: API_URL,

  get<T>(p: string, o?: Options) {
    return request<T>(p, { ...o, method: "GET" });
  },
  post<T>(p: string, body?: unknown, o?: Options) {
    return request<T>(p, {
      ...o,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(p: string, body?: unknown, o?: Options) {
    return request<T>(p, {
      ...o,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(p: string, body?: unknown, o?: Options) {
    return request<T>(p, {
      ...o,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  del<T>(p: string, o?: Options) {
    return request<T>(p, { ...o, method: "DELETE" });
  },
};

export default api;
