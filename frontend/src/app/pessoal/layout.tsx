import Link from "next/link";
import { Wallet, Book, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function PessoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routes = [
    {
      name: "Finanças",
      href: "/pessoal/financas",
      icon: Wallet,
    },
    {
      name: "Diário",
      href: "/pessoal/diario",
      icon: Book,
    },
    {
      name: "Quadro de Metas",
      href: "/pessoal/quadro",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/50 p-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar ao Início</span>
        </Link>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-blue-500">
            Pessoal
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Organize sua vida cotidiana</p>
        </div>

        <nav className="flex-1 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all font-medium"
            >
              <route.icon className="w-5 h-5" />
              {route.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <Link href="/" className="text-zinc-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-blue-500">Pessoal</span>
          <div className="w-5" /> {/* Spacer */}
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
