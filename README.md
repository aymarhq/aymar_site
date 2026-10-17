# Aymar Labs

Site institucional da Aymar Labs.

## Desenvolvimento local

```bash
npm install
npm run dev
```

O build de produção pode ser validado com `npm run build`.

## Portfólio de criativos

A rota `/portfoliodectvs` reúne vídeos de sete ofertas já existentes no Google Drive. O catálogo do Drive está em `lib/portfolio.ts`; novos vídeos enviados pelo administrador são armazenados no Vercel Blob, separados por oferta, e aparecem automaticamente na página. O administrador pode remover arquivos enviados do armazenamento ou retirar vídeos do Drive do catálogo. Ao retirar um vídeo do Drive, o arquivo original continua na pasta. Vídeos adicionados diretamente às pastas do Drive não entram no catálogo automaticamente.

Configure no projeto Vercel, em **Production** e **Preview**:

- `PORTFOLIO_ADMIN_PASSWORD`: acesso à página e ao envio de vídeos.
- `PORTFOLIO_ADMIN_EMAIL`: e-mail autorizado junto à senha de administrador.
- `PORTFOLIO_STUDENT_PASSWORD`: acesso somente à visualização.
- `BLOB_READ_WRITE_TOKEN`: criado ao conectar o Blob Store `aymar-ctvs` ao projeto.

As senhas e o e-mail do administrador não devem ir para o repositório. O e-mail é verificado para o acesso de administrador; nesta versão, os alunos ainda usam uma senha compartilhada. Para uma comunidade com convites, recuperação de senha e revogação por aluno, será preciso migrar para um provedor de autenticação e armazenamento de vídeos com acesso privado. Os arquivos atuais no Drive e os novos arquivos no Blob usam URLs públicas: o login protege a página, mas alguém com um link direto ainda pode abrir o vídeo. As pastas do Drive devem permanecer com acesso por link de **Visualizador**, nunca Editor.
