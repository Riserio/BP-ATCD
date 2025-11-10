# FILIAL ATCD – Corretoras (Netlify)

## Deploy rápido (arrastar e soltar)
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta `kanban_netlify` inteira.
3. Pronto! O site vai gerar um link público.

## Deploy via Git (CI/CD)
1. Crie um repositório no GitHub e envie estes arquivos.
2. No Netlify: Add new site -> Import an existing project -> GitHub.
3. Build command: (deixe em branco) | Publish directory: `.`

## Observações
- Dados ficam no `localStorage` do navegador.
- Para rotas de SPA, `_redirects` já inclui fallback para `/index.html`.
- Ajuste a imagem da logo trocando o arquivo no cabeçalho ou clicando na logo no app.
