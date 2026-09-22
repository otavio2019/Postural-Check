import { Client } from "minio";

export type ImagemParaArmazenar = {
  vista: "frente" | "lateral" | "costas";
  conteudo: Buffer;
  tipo: string;
  extensao: string;
};

export type Vista = ImagemParaArmazenar["vista"];
export type CaminhosImagens = Record<Vista, string>;

export class MinioStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MinioStorageError";
  }
}

const bucket = process.env.MINIO_BUCKET ?? "postural-images";

const client = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT ?? 9000),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER ?? "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD ?? "minioadmin",
});

export async function garantirBucket(): Promise<void> {
  const existe = await client.bucketExists(bucket);

  if (!existe) {
    await client.makeBucket(bucket);
  }
}

export async function salvarImagens(
  analiseId: string,
  imagens: ImagemParaArmazenar[],
): Promise<CaminhosImagens> {
  const caminhos: Partial<CaminhosImagens> = {};

  try {
    await garantirBucket();

    for (const imagem of imagens) {
      const caminho = `analises/${analiseId}/${imagem.vista}${imagem.extensao}`;
      await client.putObject(bucket, caminho, imagem.conteudo, imagem.conteudo.length, {
        "Content-Type": imagem.tipo,
      });
      caminhos[imagem.vista] = caminho;
    }

    return caminhos as CaminhosImagens;
  } catch (error) {
    await removerImagens(Object.values(caminhos));
    throw new MinioStorageError("Não foi possível armazenar as imagens no MinIO.", {
      cause: error,
    });
  }
}

export async function removerImagens(caminhos: string[]): Promise<void> {
  await Promise.all(
    caminhos.map(async (caminho) => {
      try {
        await client.removeObject(bucket, caminho);
      } catch {
        // A limpeza é best-effort; o erro original continua sendo retornado.
      }
    }),
  );
}
