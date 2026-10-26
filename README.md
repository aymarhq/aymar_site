# Aymar Labs

Site institucional da Aymar Labs.

## Desenvolvimento local

```bash
npm install
npm run dev
```

O build de produção pode ser validado com `npm run build`.

## Portfólio de criativos

A rota `/portfoliodectvs` reúne vídeos de sete ofertas já existentes no Google Drive. O catálogo do Drive está em `lib/portfolio.ts`; novos vídeos enviados pelo administrador são armazenados como blobs privados, separados por oferta, e aparecem automaticamente na página. O administrador pode adicionar, renomear ou remover vídeos. Ao retirar um vídeo do Drive, o arquivo original continua na pasta. Vídeos adicionados diretamente às pastas do Drive não entram no catálogo automaticamente. Os IDs do Drive e as pastas não são enviados ao navegador; a reprodução passa por uma rota autenticada do site.

Configure no projeto Vercel, em **Production** e **Preview**:

- `PORTFOLIO_ADMIN_PASSWORD`: acesso administrativo para adicionar, renomear e remover vídeos.
- `PORTFOLIO_ADMIN_EMAIL`: e-mail autorizado junto à senha de administrador.
- `PORTFOLIO_STUDENT_PASSWORD`: acesso somente à visualização.
- `BLOB_READ_WRITE_TOKEN`: criado ao conectar o Blob Store `aymar-ctvs` ao projeto.

As senhas e o e-mail do administrador não devem ir para o repositório. O e-mail é verificado para o acesso de administrador; todos escolhem um username de exibição, e os alunos ainda usam uma senha compartilhada. As ações de edição e as rotas de mídia exigem uma sessão válida; usuários com a senha de visualização não recebem controles administrativos. A interface oculta o comando nativo de download e o site não fornece links do Drive, mas isso não impede extensões de captura, gravação de tela ou a extração do fluxo por alguém que já pode assistir. Isso não é DRM. Os arquivos originais do Drive precisam continuar acessíveis ao servidor para reprodução e links antigos já compartilhados não são revogados por esta aplicação. As pastas do Drive devem permanecer com acesso por link de **Visualizador**, nunca Editor. Para impedir tecnicamente a captura, seria necessário migrar para uma plataforma de vídeo com DRM e controle de acesso compatível.
