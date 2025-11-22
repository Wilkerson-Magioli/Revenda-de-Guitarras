import { Link, Outlet, useNavigate } from "react-router-dom";
import { useClienteStore } from "./context/ClienteContext";

export default function Layout() {
  const navigate = useNavigate();
  const cliente = useClienteStore((s: any) => s.cliente);

  function sair() {
    if (!confirm("Deseja sair?")) return;

    const state: any = useClienteStore.getState();
    if (typeof state.deslogaCliente === "function") {
      state.deslogaCliente();
    } else {
      useClienteStore.setState({ cliente: null, token: "" } as any);
    }

    localStorage.removeItem("cliente_token");
    navigate("/", { replace: true });
  }

  return (
    <>
      <header className="bg-black text-emerald-400">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Marca / Home */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🎸</span>
            <span className="text-xl font-extrabold">Revenda de Guitarras</span>
          </Link>

          {/* Cadeado verde (abre Admin em nova aba) */}
          <Link
            to="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-emerald-400 hover:text-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            aria-label="Área restrita do Admin (abre em nova aba)"
            title="Área restrita do Admin (abre em nova aba)"
          >
            {/* SVG (herda currentColor -> verde no header preto) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path d="M12 1.5A5.25 5.25 0 006.75 6.75v3A2.25 2.25 0 004.5 12v6.75A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75V12a2.25 2.25 0 00-2.25-2.25v-3A5.25 5.25 0 0012 1.5zm-3.75 5.25a3.75 3.75 0 117.5 0v3h-7.5v-3z" />
            </svg>
          </Link>

          {/* Ações do cliente */}
          <div className="flex items-center gap-3">
            {cliente?.id ? (
              <>
                <span className="hidden sm:inline">
                  Olá, <span className="font-semibold">{cliente.nome}</span>
                </span>

                <Link
                  to="/minhas-propostas"
                  className="rounded-xl border border-emerald-500/40 px-4 py-2 text-emerald-400 hover:bg-neutral-900 transition"
                >
                  Minhas Propostas
                </Link>

                <button
                  onClick={sair}
                  type="button"
                  className="rounded-xl border border-emerald-500/40 px-4 py-2 text-emerald-400 hover:bg-neutral-900 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl border border-emerald-500/40 px-4 py-2 text-emerald-400 hover:bg-neutral-900 transition"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}
