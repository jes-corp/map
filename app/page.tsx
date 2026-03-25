"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function Home() {
  const { user, isLoading, logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-purple-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
      </div>

      <nav className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          TuApp
        </div>
        <div className="flex gap-4">
          {user ? (
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Cerrar Sesión
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-sm font-medium hover:text-purple-400 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
              >
                Registrarme
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">
        {user ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Conectado exitosamente
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Bienvenido,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                {user.username}
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Has iniciado sesión correctamente. Aquí están tus detalles de perfil extraídos de tu configuración personalizada.
            </p>

            <div className="max-w-md mx-auto mt-12 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-left space-y-4 shadow-2xl">
              <div className="pb-4 border-b border-white/10 mb-4">
                <h3 className="text-lg font-semibold text-white">Tu Perfil</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm items-center">
                <span className="text-zinc-500">Email</span>
                <span className="col-span-2 text-zinc-200">{user.email || "No provisto"}</span>
                
                <span className="text-zinc-500">Nombre</span>
                <span className="col-span-2 text-zinc-200">{user.firstName || "-"} {user.lastName || "-"}</span>
                
                <span className="text-zinc-500">Sub ID</span>
                <span className="col-span-2 text-zinc-400 font-mono text-xs overflow-hidden text-ellipsis">{user.sub || "N/A"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter">
              El futuro de tu{" "}
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
                identidad digital
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mt-8">
              Experimenta un inicio de sesión rápido, seguro y con un diseño de clase mundial que impresiona.
            </p>

            <div className="flex items-center justify-center gap-4 mt-12">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-white text-black text-base font-semibold hover:scale-105 transition-transform"
              >
                Comenzar ahora
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-full bg-white/10 border border-white/10 text-white text-base font-semibold hover:bg-white/20 transition-all font-medium"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
