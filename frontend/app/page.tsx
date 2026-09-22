"use client";

import { FormEvent, useState } from "react";

type Resultado = {
  mensagem: string;
  paciente: string;
  idade: number;
  observacoes: string | null;
  resultado: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarAnalise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setErro("");
    setResultado(null);

    try {
      const resposta = await fetch(`${apiUrl}/analise-postural`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          idade: Number(idade),
          observacoes: observacoes || null,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Confira os dados informados e tente novamente.");
      }

      const dados: Resultado = await resposta.json();
      setResultado(dados);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível conectar à API.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <section className="mx-auto max-w-3xl">
        <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
          Primeira integração com a API
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Postural Check</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          Preencha os dados abaixo para enviar uma solicitação de análise postural ao backend em Python.
        </p>

        <form onSubmit={enviarAnalise} className="mt-8 space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-200">
              Nome
              <input
                required
                minLength={2}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite o nome"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-200">
              Idade
              <input
                required
                min={1}
                max={120}
                type="number"
                value={idade}
                onChange={(event) => setIdade(event.target.value)}
                placeholder="Ex.: 30"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-200">
            Observações
            <textarea
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Descreva alguma observação sobre a postura"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            />
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar para análise"}
          </button>

          {erro && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{erro}</p>}

          {resultado && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold">{resultado.mensagem}</p>
              <p className="mt-2">Paciente: {resultado.paciente}</p>
              <p>Resultado: {resultado.resultado}</p>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
