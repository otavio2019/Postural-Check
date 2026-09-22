import { randomUUID } from "node:crypto";
import path from "node:path";

import type { FastifyInstance, FastifyRequest } from "fastify";
import type { MultipartFile } from "@fastify/multipart";

import { prisma } from "../lib/prisma.js";
import {
  MinioStorageError,
  removerImagens,
  salvarImagens,
  type CaminhosImagens,
  type ImagemParaArmazenar,
} from "../services/minio.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const REQUIRED_FIELDS = new Set(["imagem_frente", "imagem_lateral", "imagem_costas"]);

type ImagemRecebida = ImagemParaArmazenar & { nomeArquivo: string };

type DadosUpload = {
  nome?: string;
  idade?: string;
  observacoes?: string;
  imagens: Map<string, ImagemRecebida>;
};

function extensaoPermitida(tipo: string, nomeArquivo: string): string | null {
  const extensao = path.extname(nomeArquivo).toLowerCase();
  const extensoesPorTipo: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  };

  return ALLOWED_TYPES.has(tipo) && extensoesPorTipo[tipo]?.includes(extensao)
    ? extensao === ".jpeg"
      ? ".jpg"
      : extensao
    : null;
}

async function lerUpload(request: FastifyRequest): Promise<DadosUpload> {
  const dados: DadosUpload = { imagens: new Map() };

  for await (const parte of request.parts()) {
    if (parte.type === "field") {
      if (parte.fieldname === "nome") dados.nome = String(parte.value);
      if (parte.fieldname === "idade") dados.idade = String(parte.value);
      if (parte.fieldname === "observacoes") dados.observacoes = String(parte.value);
      continue;
    }

    const imagem = parte as MultipartFile;
    if (!REQUIRED_FIELDS.has(imagem.fieldname)) {
      await imagem.toBuffer();
      continue;
    }

    if (dados.imagens.has(imagem.fieldname)) {
      throw new Error(`O campo ${imagem.fieldname} foi enviado mais de uma vez.`);
    }

    const extensao = extensaoPermitida(imagem.mimetype, imagem.filename);
    if (!extensao) {
      throw new Error(`${imagem.fieldname} deve ser uma imagem JPEG, PNG ou WEBP válida.`);
    }

    const conteudo = await imagem.toBuffer();
    if (conteudo.length > MAX_IMAGE_SIZE) {
      throw new Error(`${imagem.fieldname} deve ter no máximo 10 MB.`);
    }

    const vista = imagem.fieldname.replace("imagem_", "") as ImagemParaArmazenar["vista"];
    dados.imagens.set(imagem.fieldname, {
      vista,
      conteudo,
      tipo: imagem.mimetype,
      extensao,
      nomeArquivo: imagem.filename,
    });
  }

  return dados;
}

function validarDados(dados: DadosUpload): { nome: string; idade: number; observacoes: string | null } {
  const nome = dados.nome?.trim() ?? "";
  const idade = Number(dados.idade);
  const observacoes = dados.observacoes?.trim() || null;

  if (nome.length < 2 || nome.length > 100) {
    throw new Error("O nome deve ter entre 2 e 100 caracteres.");
  }

  if (!Number.isInteger(idade) || idade < 1 || idade > 120) {
    throw new Error("A idade deve ser um número inteiro entre 1 e 120.");
  }

  if (observacoes && observacoes.length > 500) {
    throw new Error("As observações devem ter no máximo 500 caracteres.");
  }

  for (const campo of REQUIRED_FIELDS) {
    if (!dados.imagens.has(campo)) {
      throw new Error(`O campo ${campo} é obrigatório.`);
    }
  }

  return { nome, idade, observacoes };
}

export async function registerPosturalRoutes(app: FastifyInstance): Promise<void> {
  app.post("/analise-postural/imagem", async (request, reply) => {
    let caminhos: CaminhosImagens | null = null;

    try {
      const dados = await lerUpload(request);
      const paciente = validarDados(dados);
      const analiseId = randomUUID().replaceAll("-", "");
      const imagens = Array.from(dados.imagens.values());

      caminhos = await salvarImagens(analiseId, imagens);

      const analise = await prisma.analise.create({
        data: {
          id: analiseId,
          nome: paciente.nome,
          idade: paciente.idade,
          observacoes: paciente.observacoes,
          imagemFrentePath: caminhos.frente,
          imagemLateralPath: caminhos.lateral,
          imagemCostasPath: caminhos.costas,
        },
      });

      return reply.code(201).send({
        mensagem: "As três imagens foram armazenadas com sucesso",
        analise_id: analise.id,
        nome: analise.nome,
        status: analise.status,
        imagens: {
          frente: "armazenada",
          lateral: "armazenada",
          costas: "armazenada",
        },
      });
    } catch (error) {
      if (caminhos) await removerImagens(Object.values(caminhos));

      const mensagem = error instanceof Error ? error.message : "Não foi possível criar a análise.";
      const statusCode = error instanceof MinioStorageError ? 503 : 400;
      return reply.code(statusCode).send({ erro: mensagem });
    }
  });
}
