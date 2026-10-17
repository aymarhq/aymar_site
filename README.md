# Aymar Labs

## Área de membros

`/membros` exige login e senha. A página de entrada fica em `/membros/entrar` e usa o mesmo sistema visual do site. O conteúdo interno está reservado para a próxima etapa.

Configure estas variáveis no ambiente local (`.env.local`) e no projeto de produção da Vercel:

```text
MEMBERS_USERNAME=login-escolhido
MEMBERS_PASSWORD=senha-forte-com-pelo-menos-12-caracteres
MEMBERS_SESSION_SECRET=chave-aleatoria-com-pelo-menos-32-caracteres
```

O arquivo `.env.example` mostra o formato. Valores reais não devem ser commitados. Sem as três variáveis válidas, o login permanece fechado.

Esta primeira versão usa um único acesso compartilhado. A sessão dura 12 horas em cookie HTTP-only, com assinatura no servidor; sair da conta apaga o cookie. Trocar a senha ou a chave invalida as sessões existentes.
