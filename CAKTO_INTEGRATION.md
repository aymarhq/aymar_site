# Pagamentos e acesso pela Cakto

O checkout público dos 50 Formatos usa `https://pay.cakto.com.br/35i4ijs_1256672`. A rota antiga `/api/checkout/formatos` agora redireciona para esse checkout.

## Variáveis de produção

No projeto da Aymar Labs na Vercel, configure em Production:

| Variável | Uso |
| --- | --- |
| `CAKTO_WEBHOOK_SECRET` | A mesma chave criada no cadastro do webhook da Cakto. Nunca colocar no código ou no Git. |
| `CAKTO_FORMATOS_PRODUCT_SHORT_ID` | ID curto do produto. Para o link atual: `35i4ijs`. |
| `CAKTO_FORMATOS_PRODUCT_ID` | Opcional; ID interno do produto mostrado no payload Cakto. |
| `CAKTO_BLOB_READ_WRITE_TOKEN` | Token do Blob privado de compras, contas e links de acesso. |
| `RESEND_API_KEY` | Envio dos e-mails de ativação e login. |
| `RESEND_FROM_EMAIL` | Remetente em domínio verificado, por exemplo `Aymar Labs <acesso@aymarlabs.com.br>`. |
| `APP_URL` | `https://www.aymarlabs.com.br`. |
| `FORMATOS_ACCESS_EMAILS` | E-mails administrativos separados por vírgula. |

Os IDs de Prompts Motion e Legendas são opcionais e só devem ser preenchidos depois que esses produtos forem configurados na Cakto.

## Cadastro do webhook

Use este endpoint na Cakto:

`https://www.aymarlabs.com.br/api/cakto/webhook`

Associe o produto 50 Formatos e selecione `purchase_approved`, `refund` e `chargeback`. Selecione o disparo individual. Configure uma chave secreta forte no campo da Cakto e cadastre exatamente a mesma chave em `CAKTO_WEBHOOK_SECRET` na Vercel Production. A chave não deve ser compartilhada no chat, em arquivos do projeto ou no Git.

O endpoint valida `X-Cakto-Timestamp` e `X-Cakto-Signature` com HMAC-SHA256, confere a chave do payload, libera apenas pedidos pagos e deduplica pelo ID do pedido. Reembolsos e chargebacks revogam o acesso. Eventos de Pix ainda não pago não liberam o produto.

## E-mail e acesso

Depois de confirmar a compra, o sistema envia ao e-mail da Cakto um link individual para ativar o acesso. O link expira em 48 horas e só pode ser usado uma vez. A biblioteca `/ds` usa login sem senha: a pessoa informa o e-mail da compra e recebe no Gmail um link válido por 15 minutos. O e-mail administrativo em `FORMATOS_ACCESS_EMAILS` também pode solicitar esse link.

No checkout da Cakto, configure o retorno para:

`https://www.aymarlabs.com.br/50formatos/obrigado`

Essa página informa ao comprador que o e-mail de acesso chega depois da confirmação do pagamento. O webhook precisa estar ativo e as variáveis de produção configuradas para que o envio funcione.
