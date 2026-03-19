import Link from "next/link";
import { Brain, GraduationCap, Library, ArrowLeft } from "lucide-react";

export default function MenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routes = [
    {
      name: "Estudos",
      href: "/mente/estudos",
      icon: GraduationCap,
    },
    {
      name: "Biblioteca",
      href: "/mente/biblioteca",
      icon: Library,
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
        
        <div className="mb-8 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <div>
                <h2 className="text-xl font-bold tracking-tight text-purple-500">
                    Mente
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Foco e Aprendizado</p>
            </div>
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
          <span className="font-bold text-purple-500 flex items-center gap-2">
            <Brain className="w-4 h-4" /> Mente
          </span>
          <div className="w-5" /> {/* Spacer */}
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
