import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdminStore } from "./context/AdminContext";

function MenuItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block px-6 py-4 text-lg transition-colors",
          "hover:bg-neutral-900 hover:text-emerald-300",
          isActive ? "bg-neutral-900 text-emerald-300" : "text-emerald-200",
        ].join(" ")
      }
      end
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  const admin = useAdminStore((s) => s.admin);
  const deslogaAdmin = useAdminStore((s) => s.deslogaAdmin);
  const navigate = useNavigate();

  // Rehidrata o store a partir do localStorage ao abrir/atualizar a página
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_info");
      const token = localStorage.getItem("admin_token");
      if (raw && token) {
        const info = JSON.parse(raw);
        useAdminStore.getState().logaAdmin(info, token);
      }
    } catch {
      // silencia erros de parse
    }
  }, []);

  function handleLogout() {
    deslogaAdmin();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-neutral-200">
      {/* Header preto, largura total */}
      <header className="sticky top-0 z-40 h-16 w-full bg-black text-emerald-400 shadow">
        <div className="mx-auto h-full max-w-7xl px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">🎸</span>
            <span className="text-2xl font-extrabold">
              Revenda de Guitarras: Admin
            </span>
          </div>
          {admin && (
            <div className="text-emerald-300 text-sm md:text-base">
              {admin.nome}
            </div>
          )}
        </div>
      </header>

      {/* Corpo: sidebar preta + conteúdo em cinza */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar TODA PRETA encostando no header e até o rodapé */}
        <aside className="w-72 bg-black text-emerald-200">
          <nav className="pt-6">
            <MenuItem to="/admin">Visão Geral</MenuItem>
            <MenuItem to="/admin/guitarras">Cadastro de Guitarras</MenuItem>
            <MenuItem to="/admin/clientes">Controle de Clientes</MenuItem>
            <MenuItem to="/admin/propostas">Controle de Propostas</MenuItem>

            {/* nível 2 ou 3 enxerga “Controle de Admins” */}
            {(admin?.nivel ?? 1) >= 2 && (
              <MenuItem to="/admin/admins">Controle de Admins</MenuItem>
            )}

            <div className="mt-10 border-t border-white/10" />

            <button
              onClick={handleLogout}
              className="m-4 mt-6 w-[calc(100%-2rem)] rounded-lg bg-neutral-900 px-4 py-3 text-left font-medium text-emerald-300 hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              type="button"
            >
              Sair do Sistema
            </button>
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1">
          {/* Container central do conteúdo em cinza ao redor */}
          <div className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
