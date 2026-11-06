# 🚀 Publicação automática

Ao enviar uma tag de versão (`v1.3.0`, por exemplo), o workflow [`release.yml`](../.github/workflows/release.yml):

1. confere se a tag é igual à `version` do `manifest.json` (e para se não for);
2. gera o `.zip` com `scripts/build.sh`;
3. cria uma Release no GitHub com o `.zip` anexado;
4. envia o pacote para a Chrome Web Store e o submete para revisão com `scripts/publish.sh`.

Se os secrets da loja não estiverem configurados, os passos 1 a 3 rodam normalmente e o passo 4 é pulado com um aviso.

---

## Lançando uma nova versão

1. Altere a `version` no `manifest.json` (ex.: `1.3.0`) e atualize o changelog do README.
2. Faça o commit e envie para a `main`.
3. Crie e envie a tag:

   ```bash
   git tag v1.3.0
   git push origin v1.3.0
   ```

4. Acompanhe em **Actions** no GitHub. Depois, a versão passa pela revisão normal da Chrome Web Store.

Para gerar o `.zip` localmente, sem publicar: `scripts/build.sh` (o arquivo vai para `dist/`).

---

## Configuração inicial (uma vez só)

Você vai precisar de 4 valores, que serão cadastrados como secrets no GitHub:

| Secret | O que é |
|---|---|
| `CWS_PUBLISHER_ID` | ID de publisher da sua conta de desenvolvedor |
| `CWS_CLIENT_ID` | ID do cliente OAuth |
| `CWS_CLIENT_SECRET` | Chave secreta do cliente OAuth |
| `CWS_REFRESH_TOKEN` | Token que permite ao workflow agir em nome da sua conta |

O ID da extensão (`jbagdmhabgekcnichjjpbfneicoabjmh`) já está no workflow.

### 1. ID de publisher

No [Developer Dashboard](https://chrome.google.com/webstore/devconsole), abra **Conta** e copie o **ID de publisher**.

### 2. Projeto no Google Cloud e API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie um projeto (ex.: `criptoprice-publish`).
2. Em **APIs e serviços → Biblioteca**, procure **Chrome Web Store API** e clique em **Ativar**.

### 3. Tela de consentimento OAuth

1. Em **APIs e serviços → Tela de consentimento OAuth** (ou **Google Auth Platform**), configure o app como **Externo**, com seu e-mail como contato.
2. Adicione seu e-mail como usuário de teste.
3. **Importante:** depois de configurar, mude o status de publicação para **Em produção**. Enquanto o app estiver em **Teste**, o refresh token expira em 7 dias e o workflow começa a falhar. Não é preciso passar por verificação do Google para uso próprio.

### 4. Cliente OAuth

1. Em **APIs e serviços → Credenciais**, clique em **Criar credenciais → ID do cliente OAuth**.
2. Tipo: **Aplicativo da Web**.
3. Em **URIs de redirecionamento autorizados**, adicione `https://developers.google.com/oauthplayground`.
4. Guarde o **ID do cliente** e a **chave secreta do cliente**.

### 5. Refresh token

1. Abra o [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. Clique na engrenagem ⚙️ (canto superior direito), marque **Use your own OAuth credentials** e cole o ID e a chave secreta do cliente.
3. No campo **Input your own scopes**, digite `https://www.googleapis.com/auth/chromewebstore` e clique em **Authorize APIs**.
4. Entre com a **mesma conta Google da Chrome Web Store** e autorize.
5. Clique em **Exchange authorization code for tokens** e copie o **Refresh token**.

### 6. Secrets no GitHub

No repositório, vá em **Settings → Secrets and variables → Actions → New repository secret** e crie os 4 secrets da tabela acima.

> Nunca coloque esses valores em arquivos do repositório nem os compartilhe em chats.

---

## Problemas comuns

| Erro no workflow | Causa provável |
|---|---|
| `A tag não bate com a versão do manifest.json` | Esqueceu de alterar a `version` antes de criar a tag. Apague a tag (`git push --delete origin vX.Y.Z` e `git tag -d vX.Y.Z`), corrija e crie de novo. |
| `HTTP 400` com `invalid_grant` ao obter o token | Refresh token expirado ou revogado (veja o passo 3). Gere outro no passo 5. |
| `HTTP 403` no upload | A conta que gerou o token não é dona da extensão, ou a API não foi ativada no projeto. |
| `HTTP 400` no upload citando a versão | A versão do `manifest.json` precisa ser maior que a publicada na loja. |
| Erro ao publicar após o upload | A visibilidade foi alterada manualmente no painel. Faça uma publicação manual uma vez e as próximas voltam a funcionar pela API. |

Referência: [Use the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api).
