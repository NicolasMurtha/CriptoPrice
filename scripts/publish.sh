#!/usr/bin/env bash
# Envia um .zip para a Chrome Web Store (API v2) e o submete para revisão.
# Uso: scripts/publish.sh dist/CriptoPrice-<versão>.zip
#
# Variáveis de ambiente obrigatórias:
#   CWS_ACCESS_TOKEN  token de acesso da conta de serviço, com o escopo
#                     https://www.googleapis.com/auth/chromewebstore
#                     (gerado por scripts/sa-token.sh a partir da chave da conta de serviço)
#   CWS_PUBLISHER_ID  ID de publisher (Developer Dashboard > Conta)
#   CWS_EXTENSION_ID  ID da extensão na loja
set -euo pipefail

ZIP="${1:?Informe o caminho do .zip}"
[[ -f "$ZIP" ]] || { echo "Erro: arquivo '$ZIP' não encontrado" >&2; exit 1; }

for var in CWS_ACCESS_TOKEN CWS_PUBLISHER_ID CWS_EXTENSION_ID; do
  [[ -n "${!var:-}" ]] || { echo "Erro: variável $var não definida" >&2; exit 1; }
done

API_BASE="${CWS_API_BASE:-https://chromewebstore.googleapis.com}"
ITEM="publishers/${CWS_PUBLISHER_ID}/items/${CWS_EXTENSION_ID}"

# Faz uma requisição e aborta com a resposta da API se o status não for 2xx.
requisicao() {
  local saida status
  saida=$(mktemp)
  status=$(curl -sS -o "$saida" -w '%{http_code}' "$@")
  if [[ "$status" != 2* ]]; then
    echo "Erro: HTTP $status" >&2
    cat "$saida" >&2
    echo >&2
    rm -f "$saida"
    exit 1
  fi
  cat "$saida"
  rm -f "$saida"
}

AUTH=(-H "Authorization: Bearer ${CWS_ACCESS_TOKEN}")

echo "==> Enviando $ZIP"
UPLOAD=$(requisicao -X POST "${API_BASE}/upload/v2/${ITEM}:upload" "${AUTH[@]}" \
  -H "Content-Type: application/zip" --data-binary "@${ZIP}")
echo "$UPLOAD"

# O processamento do pacote pode ser assíncrono: aguarda sair de IN_PROGRESS.
ESTADO=$(jq -r '.uploadState // empty' <<<"$UPLOAD")
tentativas=0
while [[ "$ESTADO" == "IN_PROGRESS" || "$ESTADO" == "UPLOAD_IN_PROGRESS" ]]; do
  (( tentativas++ < 30 )) || { echo "Erro: upload ainda em processamento após 5 minutos" >&2; exit 1; }
  sleep 10
  STATUS=$(requisicao "${API_BASE}/v2/${ITEM}:fetchStatus" "${AUTH[@]}")
  ESTADO=$(jq -r '.lastAsyncUploadState // .uploadState // empty' <<<"$STATUS")
  echo "    estado do upload: ${ESTADO:-desconhecido}"
done
if [[ "$ESTADO" == *FAIL* ]]; then
  echo "Erro: a loja recusou o pacote" >&2
  exit 1
fi

echo "==> Enviando para revisão"
requisicao -X POST "${API_BASE}/v2/${ITEM}:publish" "${AUTH[@]}" \
  -H "Content-Type: application/json" -d '{}'
echo
echo "==> Pronto: a nova versão foi enviada para revisão na Chrome Web Store"
