# Checkout Stripe — 50 Formatos de Criativos

O Checkout hospedado foi ligado à landing page e o cadastro da conta compara o e-mail do comprador com o e-mail confirmado pela Stripe. Cada e-mail de compra pode criar uma única conta; o titular pode voltar e entrar com a senha que cadastrou. O fluxo **não está pronto para receber pagamentos** até concluir as configurações abaixo.

## Valores a substituir

**Arquivo com placeholder:** [.env.example](.env.example). Copie os nomes das variáveis para o ambiente seguro da hospedagem (ou `.env.local` somente no desenvolvimento).

| Campo | Valor atual | O que configurar |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | vazio | Nova chave secreta de teste para homologação; chave ativa apenas quando for lançar. Revogue a chave de teste exposta no chat antes de usá-la. |
| `STRIPE_FORMATOS_PRICE_ID` | `price_...` | ID do preço **avulso em BRL de R$ 19,90** criado no Stripe. O preço da landing page não altera o valor cobrado pelo Stripe. |
| `APP_URL` | `https://www.aymarlabs.com.br` | Confirme o domínio real da implantação; em desenvolvimento, use `http://localhost:3000`. |
| `BLOB_READ_WRITE_TOKEN` | vazio no exemplo | Configure o store Blob da Vercel. A aplicação grava o cadastro em um objeto **privado** por e-mail. Sem isso, o checkout fica desativado para não aceitar pagamento sem criar o acesso. |

`mode`, `success_url` e `cancel_url` não estão com placeholders: o produto é avulso (`payment`), o retorno de sucesso é `/50formatos/obrigado` e o cancelamento volta para `/50formatos`.

## Parâmetros configurados

**Arquivo:** [app/api/checkout/formatos/route.ts](app/api/checkout/formatos/route.ts). Usa o SDK Stripe v23, sem fixar manualmente a versão da API.

| Parâmetro | Valor |
| --- | --- |
| `ui_mode` | `hosted_page` |
| `mode` | `payment` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0002` |
| `origin_context` | `web` |
| `customer_creation` | `always` |

`payment_method_collection` foi omitido porque o produto é uma cobrança avulsa; as instruções do Stripe fornecidas para este projeto o incluem apenas no modo `subscription`. Antes de abrir uma sessão, o servidor confirma que o Price ID está ativo, é avulso e custa exatamente R$ 19,90.

## Configuração e testes

1. Rotacione/revogue a chave de teste compartilhada no chat. Gere outra e salve `STRIPE_SECRET_KEY` apenas como variável protegida no servidor/Vercel.
2. Crie no Stripe um produto com preço único de **R$ 19,90** e configure `STRIPE_FORMATOS_PRICE_ID` com o ID `price_...` real. Chave e preço devem pertencer ao mesmo modo: teste com teste, ativo com ativo.
3. Configure `APP_URL` e o Blob no ambiente e implante. Quando os dados estiverem completos, o botão da landing page cria a sessão no servidor e redireciona ao Checkout hospedado.
4. Teste em modo de teste com cartão `4242 4242 4242 4242`, validade futura e CVC de três dígitos. Teste também cancelamento e erro. Não use cartão real em modo de teste.
5. Após o pagamento, a página de retorno consulta a sessão na Stripe. O comprador define a senha ali; o servidor só cria a conta se a sessão estiver paga, for deste produto, custar R$ 19,90 e o e-mail bater com o da compra. O cadastro é único por e-mail e fica em Blob privado; a senha é armazenada com hash scrypt. Depois, o mesmo e-mail e senha permitem entrar novamente.
6. O acesso não é liberado apenas por abrir a página de retorno. Se o comprador fechar o navegador antes de criar a senha, a equipe precisará localizar o pagamento e orientar o cadastro. Defina também a rotina de suporte para recuperação de conta e reembolsos antes da venda.

## Arquivos e fluxo

- [app/50formatos/page.tsx](app/50formatos/page.tsx): landing e botão de compra.
- [app/api/checkout/formatos/route.ts](app/api/checkout/formatos/route.ts): criação server-side da sessão e redirecionamento 303.
- [app/50formatos/obrigado/page.tsx](app/50formatos/obrigado/page.tsx): valida o retorno e inicia o cadastro usando o e-mail confirmado pela Stripe.
- [app/api/checkout/formatos/claim/route.ts](app/api/checkout/formatos/claim/route.ts) e [app/api/checkout/formatos/login/route.ts](app/api/checkout/formatos/login/route.ts): criam a conta uma vez e autenticam o comprador.
- [lib/formats-access.ts](lib/formats-access.ts): valida sessões pagas, guarda credenciais em Blob privado e assina a sessão de acesso.

Referências: [Stripe Checkout](https://docs.stripe.com/payments/checkout/quickstarts), [testes](https://docs.stripe.com/testing), [chaves](https://docs.stripe.com/keys), [suporte](https://support.stripe.com/).
