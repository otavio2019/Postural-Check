const futureModules = [
  "Interface da aplicação",
  "Fluxos de análise postural",
  "Integrações com backend",
  "Processamento de imagens",
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/40">
        <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
          Estrutura inicial pronta
        </span>
        <div className="mt-6 space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">Postural Check</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            Projeto base configurado com Next.js, TypeScript e Tailwind CSS para iniciar o desenvolvimento do frontend.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {futureModules.map((module) => (
            <div
              key={module}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300"
            >
              {module}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
