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

A autenticação usa uma **conta de serviço** do Google Cloud. Não é preciso configurar tela de consentimento OAuth, ter domínio nem política de privacidade, e a credencial não expira.

Você vai cadastrar 2 secrets no GitHub:

| Secret | O que é |
|---|---|
| `CWS_PUBLISHER_ID` | ID de publisher da sua conta de desenvolvedor |
| `CWS_SERVICE_ACCOUNT_KEY` | Conteúdo completo do arquivo de chave JSON da conta de serviço |

O ID da extensão (`jbagdmhabgekcnichjjpbfneicoabjmh`) já está no workflow.

### 1. ID de publisher

No [Developer Dashboard](https://chrome.google.com/webstore/devconsole), abra **Conta** e copie o **ID de publisher**.

### 2. Projeto no Google Cloud e API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie um projeto (ex.: `criptoprice-publish`).
2. Em **APIs e serviços → Biblioteca**, procure **Chrome Web Store API** e clique em **Ativar**.

### 3. Conta de serviço e chave

1. No mesmo projeto, vá em **IAM e administrador → Contas de serviço → Criar conta de serviço**.
2. Dê um nome (ex.: `criptoprice-publish`) e conclua. Não é preciso atribuir nenhum papel.
3. Abra a conta criada e copie o **e-mail** dela (algo como `criptoprice-publish@criptoprice-publish.iam.gserviceaccount.com`).
4. Na aba **Chaves**, clique em **Adicionar chave → Criar nova chave → JSON**. Um arquivo `.json` será baixado. Guarde-o com cuidado: ele dá acesso para publicar a extensão.

### 4. Dar acesso à conta de serviço na loja

No [Developer Dashboard](https://chrome.google.com/webstore/devconsole), em **Conta**, adicione o **e-mail da conta de serviço** no campo de acesso à API. Só é permitida uma conta de serviço por publisher.

### 5. Secrets no GitHub

No repositório, vá em **Settings → Secrets and variables → Actions → New repository secret** e crie:

- `CWS_PUBLISHER_ID`: o ID do passo 1;
- `CWS_SERVICE_ACCOUNT_KEY`: abra o arquivo `.json` do passo 3 num editor de texto e cole **todo** o conteúdo.

Depois disso, apague o arquivo `.json` do seu computador (ou guarde num gerenciador de senhas).

> Nunca coloque a chave em arquivos do repositório nem a compartilhe em chats. Se ela vazar, apague-a na aba **Chaves** da conta de serviço e crie outra.

### Publicar manualmente pelo terminal (opcional)

```bash
export CWS_ACCESS_TOKEN=$(scripts/sa-token.sh caminho/da/chave.json)
CWS_PUBLISHER_ID=<seu-id> CWS_EXTENSION_ID=jbagdmhabgekcnichjjpbfneicoabjmh scripts/publish.sh "$(scripts/build.sh)"
```

---

## Problemas comuns

| Erro no workflow | Causa provável |
|---|---|
| `A tag não bate com a versão do manifest.json` | Esqueceu de alterar a `version` antes de criar a tag. Apague a tag (`git push --delete origin vX.Y.Z` e `git tag -d vX.Y.Z`), corrija e crie de novo. |
| `Erro ao obter token` com `invalid_grant` | Chave apagada/inválida, ou o secret `CWS_SERVICE_ACCOUNT_KEY` foi colado incompleto. Crie uma nova chave e cole o JSON inteiro. |
| `HTTP 403` no upload | O e-mail da conta de serviço não foi adicionado no Developer Dashboard (passo 4), ou a Chrome Web Store API não foi ativada no projeto (passo 2). |
| `HTTP 400` no upload citando a versão | A versão do `manifest.json` precisa ser maior que a publicada na loja. |
| Erro ao publicar após o upload | A visibilidade foi alterada manualmente no painel. Faça uma publicação manual uma vez e as próximas voltam a funcionar pela API. |

Referências: [Use the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api) · [Use a service account with the Chrome Web Store API](https://developer.chrome.com/docs/webstore/service-accounts).
