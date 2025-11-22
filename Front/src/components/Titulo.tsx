import { Link, useNavigate } from "react-router-dom";
import { useClienteStore } from "../context/ClienteContext";

export default function Titulo() {
  const navigate = useNavigate();
  const { cliente, clearAuth } = useClienteStore();

  const sair = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <header className="bg-black text-emerald-400">
      <div className="mx-auto max-w-7xl p-4 flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎸</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-400">
            Revenda de Guitarras
          </h1>
        </div>

        {/* Ações à direita */}
        {cliente.id ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-emerald-300">
              Olá, <b>{cliente.nome}</b>
            </span>

            <Link
              to="/minhas-propostas"
              className="rounded-xl bg-black px-4 py-2 text-emerald-400 border border-emerald-500/40 hover:bg-neutral-900 transition focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              Minhas Propostas
            </Link>

            <button
              type="button"
              onClick={sair}
              className="rounded-xl bg-black px-4 py-2 text-emerald-400 border border-emerald-500/40 hover:bg-neutral-900 transition focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-xl bg-black px-4 py-2 text-emerald-400 border border-emerald-500/40 hover:bg-neutral-900 transition focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
