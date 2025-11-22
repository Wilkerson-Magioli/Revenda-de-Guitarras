import { NavLink, useNavigate } from "react-router-dom";
import { useAdminStore } from "../context/AdminContext";

export default function MenuLateral() {
  const deslogaAdmin = useAdminStore((s) => s.deslogaAdmin);
  const admin = useAdminStore((s) => s.admin);
  const navigate = useNavigate();

  // garante número mesmo se vier como string/undefined
  const nivel = Number(admin?.nivel ?? 1);

  const linkBase =
    "block px-6 py-4 text-lg transition-colors hover:bg-neutral-900 hover:text-emerald-300";
  const active = "bg-neutral-900 text-emerald-300";
  const idle = "text-emerald-200";

  function logout() {
    deslogaAdmin();
    navigate("/admin/login", { replace: true });
  }

  return (
    <aside className="w-72 bg-black text-emerald-200">
      <nav className="pt-6">
        <NavLink end to="/admin" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>Visão Geral</NavLink>
        <NavLink to="/admin/guitarras" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>Cadastro de Guitarras</NavLink>
        <NavLink to="/admin/clientes" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>Controle de Clientes</NavLink>
        <NavLink to="/admin/propostas" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>Controle de Propostas</NavLink>

        {/* nível 2+ enxerga “Controle de Admins” */}
        {nivel >= 2 && (
          <NavLink to="/admin/admins" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>
            Controle de Admins
          </NavLink>
        )}

        <div className="mt-10 border-t border-white/10" />

        <button
          onClick={logout}
          className="m-4 mt-6 w-[calc(100%-2rem)] rounded-lg bg-neutral-900 px-4 py-3 text-left font-medium text-emerald-300 hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          type="button"
        >
          Sair do Sistema
        </button>
      </nav>
    </aside>
  );
}
