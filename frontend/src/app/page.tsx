"use client";

import Link from "next/link";
import { User, Brain, Dumbbell, Sparkles, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface DashboardData {
  pessoal: { totalBalance: number };
  mente: { readingBooks: number; completedLessons: number };
  corpo: { currentWeight: number };
  alma: { hobbyCount: number };
}

function AuthStatus() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return <div className="animate-pulse w-8 h-8 rounded-full bg-zinc-800" />;

  if (!user) {
    return (
      <Link 
        href="/auth/login" 
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-all text-sm"
      >
        <LogIn className="w-4 h-4" />
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-zinc-400 hidden md:block">Olá, <span className="text-white font-semibold">{user.name}</span></span>
      <button 
        onClick={logout}
        className="p-2 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white"
        title="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (user) {
      apiFetch<DashboardData>("/dashboard/resumo")
        .then(setStats)
        .catch(console.error);
    }
  }, [user]);

  console.log("tenis")

  const pillars = [
    {
      name: "Pessoal",
      href: "/pessoal",
      description: "Finanças, Diário e Metas Diárias",
      stat: stats ? `R$ ${stats.pessoal.totalBalance.toFixed(2)}` : "...",
      icon: User,
      color: "from-blue-600 to-indigo-900",
      image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Mente",
      href: "/mente",
      description: "Estudos, Revisões e Biblioteca",
      stat: stats ? `${stats.mente.readingBooks} livros ativos` : "...",
      icon: Brain,
      color: "from-purple-600 to-violet-900",
      image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Corpo",
      href: "/corpo",
      description: "Performance, Treinos e Dieta",
      stat: stats ? `${stats.corpo.currentWeight}kg atuais` : "...",
      icon: Dumbbell,
      color: "from-emerald-600 to-teal-900",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    },
    {
      name: "Alma",
      href: "/alma",
      description: "Hobbies e Brainstorm",
      stat: stats ? `${stats.alma.hobbyCount} hobbies` : "...",
      icon: Sparkles,
      color: "from-amber-600 to-orange-900",
      image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 md:px-8 py-6 md:py-12 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full flex flex-col gap-6 md:gap-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mt-4 md:mt-0 relative">
          <div className="absolute top-0 right-0">
            <AuthStatus />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-3xl font-bold tracking-tight text-white mb-1 md:mb-2">
            Ambitious System
          </h1>
          <p className="text-sm md:text-lg text-zinc-400 max-w-2xl px-2">
            Sua central de gerenciamento pessoal. Qual área da sua vida você deseja focar hoje?
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
          {pillars.map((pillar) => (
            <Link
              key={pillar.name}
              href={pillar.href}
              className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 block h-40 md:h-56 lg:h-64"
            >
              {/* Image Background */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-50"
                style={{ backgroundImage: `url(${pillar.image})` }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 z-10 bg-gradient-to-br ${pillar.color} opacity-20 mix-blend-multiply transition-opacity group-hover:opacity-40`} />
              
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 z-30 p-6 md:p-8 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-2 transform transition-transform duration-500 translate-y-3 group-hover:translate-y-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 md:p-3 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-zinc-700 shadow-xl`}>
                      <pillar.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {pillar.name}
                    </h2>
                  </div>
                  
                  {/* Stat Badge */}
                  {user && (
                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs md:text-sm font-medium text-white shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {pillar.stat}
                    </div>
                  )}
                </div>
                <p className="text-zinc-300 font-medium text-sm md:text-base opacity-0 transform translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  {pillar.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
