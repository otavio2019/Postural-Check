"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type TipoImagem = "frente" | "lateral" | "costas";

type Resultado = {
  mensagem: string;
  nome: string;
  idade: number;
  observacoes: string | null;
  status: string;
  analise_id: string;
  imagens: {
    frente: { nome_arquivo: string; tipo: string; tamanho: number };
    lateral: { nome_arquivo: string; tipo: string; tamanho: number };
    costas: { nome_arquivo: string; tipo: string; tamanho: number };
  };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const tamanhoMaximo = 10 * 1024 * 1024;

const configuracaoImagem: Record<
  TipoImagem,
  { titulo: string; descricao: string; campo: string }
> = {
  frente: {
    titulo: "Foto frontal",
    descricao: "Pessoa olhando diretamente para a câmera, com o corpo inteiro visível.",
    campo: "imagem_frente",
  },
  lateral: {
    titulo: "Foto lateral",
    descricao: "Pessoa de lado, mantendo o corpo inteiro visível.",
    campo: "imagem_lateral",
  },
  costas: {
    titulo: "Foto de costas",
    descricao: "Pessoa de costas para a câmera, com o corpo inteiro visível.",
    campo: "imagem_costas",
  },
};

export default function Home() {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [imagemFrente, setImagemFrente] = useState<File | null>(null);
  const [imagemLateral, setImagemLateral] = useState<File | null>(null);
  const [imagemCostas, setImagemCostas] = useState<File | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function atualizarImagem(tipo: TipoImagem, arquivo: File | null) {
    if (tipo === "frente") setImagemFrente(arquivo);
    if (tipo === "lateral") setImagemLateral(arquivo);
    if (tipo === "costas") setImagemCostas(arquivo);
  }

  function selecionarImagem(
    tipo: TipoImagem,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const arquivo = event.target.files?.[0] ?? null;
    setErro("");
    setResultado(null);

    if (!arquivo) {
      atualizarImagem(tipo, null);
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      atualizarImagem(tipo, null);
      setErro(`${configuracaoImagem[tipo].titulo}: selecione um arquivo de imagem.`);
      return;
    }

    if (arquivo.size > tamanhoMaximo) {
      atualizarImagem(tipo, null);
      setErro(`${configuracaoImagem[tipo].titulo}: a imagem deve ter no máximo 10 MB.`);
      return;
    }

    atualizarImagem(tipo, arquivo);
  }

  function obterImagem(tipo: TipoImagem) {
    if (tipo === "frente") return imagemFrente;
    if (tipo === "lateral") return imagemLateral;
    return imagemCostas;
  }

  function formatarTamanho(tamanho: number) {
    return `${(tamanho / (1024 * 1024)).toFixed(2)} MB`;
  }

  async function enviarAnalise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setResultado(null);

    if (!imagemFrente || !imagemLateral || !imagemCostas) {
      setErro("Selecione as três imagens: frente, lateral e costas.");
      return;
    }

    setEnviando(true);

    try {
      const formulario = new FormData();
      formulario.append("nome", nome);
      formulario.append("idade", idade);
      formulario.append("observacoes", observacoes);
      formulario.append("imagem_frente", imagemFrente);
      formulario.append("imagem_lateral", imagemLateral);
      formulario.append("imagem_costas", imagemCostas);

      const resposta = await fetch(`${apiUrl}/analise-postural/imagem`, {
        method: "POST",
        body: formulario,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        const detalhe = Array.isArray(dados.detail)
          ? "Confira os dados informados e tente novamente."
          : dados.detail ?? "Não foi possível enviar as imagens.";
        throw new Error(detalhe);
      }

      setResultado(dados as Resultado);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível conectar à API.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <section className="mx-auto max-w-4xl">
        <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
          Upload inicial de imagens
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Postural Check</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          Envie três vistas da pessoa para iniciar uma solicitação de análise postural.
          Nesta etapa, as imagens apenas serão recebidas e validadas.
        </p>

        <form
          onSubmit={enviarAnalise}
          className="mt-8 space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-200">
              Nome
              <input
                required
                minLength={2}
                maxLength={100}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite o nome"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
              />
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-100">Imagens posturais</h2>
            <p className="mt-1 text-sm text-slate-400">
              Aceitos JPEG, PNG e WEBP. Cada arquivo deve ter no máximo 10 MB.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {(Object.keys(configuracaoImagem) as TipoImagem[]).map((tipo) => {
              const configuracao = configuracaoImagem[tipo];
              const arquivo = obterImagem(tipo);

              return (
                <label key={tipo} className="space-y-2 text-sm font-medium text-slate-200">
                  {configuracao.titulo}
                  <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => selecionarImagem(tipo, event)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-emerald-300 focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
                  />
                  <span className="block text-xs font-normal leading-5 text-slate-400">
                    {configuracao.descricao}
                  </span>
                  {arquivo && (
                    <span className="block text-xs font-normal text-emerald-300">
                      {arquivo.name} ({formatarTamanho(arquivo.size)})
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-200">
            Observações
            <textarea
              maxLength={500}
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Descreva alguma observação sobre a postura"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
            />
          </label>

          <button
            type="submit"
            disabled={enviando}
            aria-busy={enviando}
            className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Enviando imagens..." : "Enviar para análise"}
          </button>

          {erro && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {erro}
            </p>
          )}

          {resultado && (
            <div role="status" aria-live="polite" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <p>Nome: {resultado.nome}</p>
              <p className="mt-2">Status: <span className="font-semibold">Imagens armazenadas com sucesso</span></p>
              <p className="mt-2">Imagem-1 entregue</p>
              <p>Imagem-2 entregue</p>
              <p>Imagem-3 entregue</p>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
