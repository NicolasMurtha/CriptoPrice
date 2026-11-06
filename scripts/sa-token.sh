#!/usr/bin/env bash
# Gera um token de acesso da Chrome Web Store a partir da chave JSON de uma conta de serviço.
# Uso: scripts/sa-token.sh caminho/da/chave.json   (ou chave em $CWS_SERVICE_ACCOUNT_KEY)
# Imprime o token em stdout.
set -euo pipefail

if [[ $# -ge 1 ]]; then
  CHAVE=$(cat "$1")
else
  CHAVE="${CWS_SERVICE_ACCOUNT_KEY:?Informe o arquivo da chave ou defina CWS_SERVICE_ACCOUNT_KEY}"
fi

EMAIL=$(jq -r '.client_email // empty' <<<"$CHAVE")
TOKEN_URI=$(jq -r '.token_uri // "https://oauth2.googleapis.com/token"' <<<"$CHAVE")
TOKEN_URI="${CWS_TOKEN_URL:-$TOKEN_URI}"
[[ -n "$EMAIL" ]] || { echo "Erro: a chave não parece ser de uma conta de serviço (sem client_email)" >&2; exit 1; }

PEM=$(mktemp)
trap 'rm -f "$PEM"' EXIT
jq -r '.private_key' <<<"$CHAVE" > "$PEM"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

AGORA=$(date +%s)
CABECALHO=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
CORPO=$(jq -cn --arg iss "$EMAIL" --arg aud "$TOKEN_URI" --argjson iat "$AGORA" \
  '{iss: $iss, scope: "https://www.googleapis.com/auth/chromewebstore", aud: $aud, iat: $iat, exp: ($iat + 3600)}' | b64url)
ASSINATURA=$(printf '%s.%s' "$CABECALHO" "$CORPO" | openssl dgst -sha256 -sign "$PEM" -binary | b64url)

RESPOSTA=$(curl -sS -X POST "$TOKEN_URI" \
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
  --data-urlencode "assertion=${CABECALHO}.${CORPO}.${ASSINATURA}")

TOKEN=$(jq -r '.access_token // empty' <<<"$RESPOSTA")
if [[ -z "$TOKEN" ]]; then
  echo "Erro ao obter token: $RESPOSTA" >&2
  exit 1
fi
printf '%s\n' "$TOKEN"
