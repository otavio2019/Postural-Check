# Próximos passos do Postural Check

## 1. Objetivo do documento

Este documento organiza a evolução do Postural Check a partir do estado atual do projeto. A ordem proposta prioriza aprendizado gradual, entregas pequenas e validação contínua. Cada etapa deve terminar com uma funcionalidade executável antes do início da etapa seguinte.

## 2. Estado atual do projeto

O projeto já possui uma aplicação web dividida em frontend e backend. O frontend utiliza Next.js, React, TypeScript e Tailwind CSS. O backend utiliza Python, FastAPI e Uvicorn. O Docker Compose executa o frontend, o backend, o PostgreSQL e o MinIO.

Neste momento, o sistema permite preencher nome, idade e observações no frontend. Esses dados são enviados para a rota `POST /analise-postural`. O backend valida os dados com um modelo Pydantic e devolve uma resposta de teste. A análise postural real ainda não foi implementada.

A estrutura relevante é:

```text
Postural-Check/
├── backend/
│   └── app/
│       ├── api/router.py
│       ├── schemas/postural.py
│       └── main.py
├── frontend/
│   └── app/page.tsx
├── docker-compose.yml
└── docs/
```

## 3. Ordem recomendada de desenvolvimento

### Etapa 1 — Consolidar o fluxo atual

O objetivo é garantir que qualquer pessoa consiga iniciar o projeto e testar o envio do formulário. A documentação deve explicar como executar o Docker Compose, como abrir o frontend, como acessar a documentação da API e como interromper os containers.

**Critério de conclusão:** o formulário envia dados válidos, a API responde com HTTP 200 e os erros de validação são exibidos de maneira compreensível.

### Etapa 2 — Organizar melhor a API

A rota atual deve ser separada em módulos conforme o backend crescer. O próximo conjunto de arquivos recomendado é:

```text
backend/app/
├── api/
│   └── routes/
│       └── postural.py
├── schemas/
│   └── postural.py
├── services/
│   └── postural_analysis.py
└── main.py
```

As rotas devem cuidar da comunicação HTTP. Os serviços devem conter as regras de negócio. Os schemas devem descrever e validar os dados de entrada e de saída.

**Critério de conclusão:** a rota continua funcionando depois da separação e a lógica de análise não fica misturada com o código da rota.

### Etapa 3 — Receber uma imagem

O formulário deverá permitir o envio de uma fotografia. O backend receberá o arquivo usando `UploadFile` do FastAPI. Nesta etapa, o sistema não precisa interpretar a imagem. Primeiro, deve validar o tipo, o tamanho e a existência do arquivo.

A rota planejada é:

```text
POST /analise-postural/imagem
```

A resposta inicial pode conter o nome do arquivo e um identificador temporário. Não é recomendável salvar arquivos definitivamente antes de definir as regras de privacidade e armazenamento.

**Critério de conclusão:** uma imagem válida é enviada pelo frontend, recebida pelo backend e rejeitada quando possui tipo ou tamanho inválido.

### Etapa 4 — Armazenar arquivos com segurança

Depois que o upload funcionar, o projeto poderá utilizar o MinIO para armazenar imagens. O PostgreSQL deverá guardar os metadados da análise, como identificador, data, status e localização do arquivo.

O sistema deve evitar armazenar imagens diretamente no banco de dados. O banco deve guardar os dados da análise, enquanto o MinIO deve guardar os arquivos.

**Critério de conclusão:** cada análise possui um identificador e o arquivo pode ser recuperado somente por uma rota autorizada.

### Etapa 5 — Criar o primeiro processamento de imagem

Antes de utilizar inteligência artificial, o sistema deve validar a imagem e gerar informações básicas. Exemplos incluem dimensões, formato, orientação e existência de uma pessoa visível.

O processamento deve ficar em um serviço separado. Isso facilita a substituição da biblioteca utilizada e permite testar o processamento sem iniciar o servidor inteiro.

**Critério de conclusão:** o backend recebe uma imagem e retorna um resultado técnico previsível, mesmo que ainda não identifique alterações posturais.

### Etapa 6 — Adicionar identificação de pontos corporais

Nesta etapa será escolhida uma biblioteca de visão computacional para detectar pontos de referência do corpo, como ombros, quadris, joelhos e tornozelos. A escolha deve considerar licença, desempenho, compatibilidade com imagens e facilidade de execução no Docker.

O resultado deve ser tratado como uma estimativa técnica. A aplicação não deve apresentar o resultado como diagnóstico médico.

**Critério de conclusão:** a API retorna os pontos detectados, a confiança de detecção e uma indicação clara quando a imagem não permite uma análise confiável.

### Etapa 7 — Calcular medidas posturais

Com os pontos corporais disponíveis, o serviço poderá calcular ângulos, diferenças de altura e possíveis assimetrias. Os cálculos devem ser documentados e testados com dados artificiais antes de serem usados em imagens reais.

Cada resultado deve informar sua limitação. Uma assimetria detectada em uma fotografia não é, por si só, uma conclusão clínica.

**Critério de conclusão:** o backend retorna medidas reproduzíveis e o frontend apresenta os valores com uma explicação simples.

### Etapa 8 — Criar histórico de análises

O usuário deverá conseguir consultar análises anteriores. Para isso, será necessário definir o modelo de dados, criar migrations e implementar rotas de consulta.

As rotas planejadas são:

```text
GET /analises
GET /analises/{id}
DELETE /analises/{id}
```

A exclusão de uma análise deve remover também o arquivo correspondente do armazenamento, respeitando as regras de segurança do projeto.

**Critério de conclusão:** uma análise pode ser criada, consultada e excluída sem deixar arquivos órfãos.

### Etapa 9 — Melhorar a experiência do frontend

O frontend deverá mostrar o progresso do upload, o estado do processamento e mensagens específicas para cada erro. Também deverá impedir o envio de arquivos inválidos antes de fazer a requisição.

A tela deve separar três situações: formulário pronto, análise em andamento e resultado disponível. Isso evita que o usuário confunda uma resposta parcial com uma análise concluída.

**Critério de conclusão:** o usuário entende o que está acontecendo em cada estado e consegue iniciar uma nova análise sem recarregar a página.

### Etapa 10 — Testes, segurança e publicação

Antes de publicar, o projeto deve receber testes para schemas, rotas, upload e cálculos. As credenciais do PostgreSQL e do MinIO devem sair do `docker-compose.yml` e passar para variáveis de ambiente. Arquivos `.env` reais não devem ser enviados ao Git.

Também devem ser configurados limites de tamanho, validação de MIME type, tratamento de erros, logs sem dados sensíveis e autenticação caso o sistema tenha usuários reais.

**Critério de conclusão:** o projeto pode ser executado em um ambiente limpo, os testes principais passam e nenhuma credencial real está versionada.

## 4. Próxima tarefa recomendada

A próxima implementação deve ser o **upload de uma imagem sem análise automática**. Essa tarefa é pequena, mas prepara a integração entre formulário, API, armazenamento e processamento.

A sequência prática será:

1. Criar um campo de imagem no frontend.
2. Enviar o arquivo usando `FormData`.
3. Criar a rota `POST /analise-postural/imagem`.
4. Validar extensão, tipo e tamanho no backend.
5. Retornar um identificador temporário.
6. Exibir no frontend uma mensagem de upload concluído.

Não será adicionada inteligência artificial nessa primeira versão. Primeiro precisamos garantir que o caminho do arquivo entre frontend e backend seja confiável.

## 5. Comandos de trabalho

Para iniciar o projeto com Docker:

```powershell
docker compose up --build
```

Para verificar os containers:

```powershell
docker compose ps
```

Para consultar os logs do backend:

```powershell
docker compose logs -f backend
```

Para parar os serviços:

```powershell
docker compose down
```

Para atualizar o projeto antes de trabalhar:

```powershell
git pull origin main
```

Depois de uma alteração validada:

```powershell
git add .
git commit -m "descricao da alteracao"
git push origin main
```

## 6. Regras para manter o projeto organizado

Cada funcionalidade deve ser implementada em uma alteração pequena. O frontend não deve conter regras de análise postural. O backend deve validar todos os dados recebidos, mesmo que o frontend também faça validações.

Os arquivos temporários, ambientes virtuais, dependências instaladas e variáveis de ambiente privadas não devem entrar no Git. Toda nova rota deve aparecer na documentação automática do FastAPI e deve possuir pelo menos um teste manual ou automatizado.

A aplicação deve usar termos como **possível assimetria**, **estimativa** e **resultado da análise**. Ela não deve apresentar uma conclusão médica nem substituir uma avaliação profissional.

## 7. Definição de uma primeira versão funcional

A primeira versão funcional poderá ser considerada pronta quando permitir que o usuário:

- envie uma imagem;
- veja o status do processamento;
- receba pontos corporais detectados;
- visualize medidas básicas de alinhamento;
- consulte o resultado depois;
- exclua a análise e o arquivo relacionado.

Essa versão deve funcionar com Docker Compose, possuir documentação de execução e não depender de comandos Python instalados diretamente no Windows.

## Referências

[1]: https://fastapi.tiangolo.com/ "FastAPI Documentation"
[2]: https://nextjs.org/docs "Next.js Documentation"
[3]: https://docs.docker.com/compose/ "Docker Compose Documentation"
[4]: https://github.com/minio/minio/blob/master/docs/docker/README.md "MinIO Docker Quickstart Guide"
[5]: https://docs.pydantic.dev/latest/ "Pydantic Documentation"
