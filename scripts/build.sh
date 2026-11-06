#!/usr/bin/env bash
# Gera dist/CriptoPrice-<versão>.zip com apenas os arquivos usados pela extensão.
# Uso: scripts/build.sh
set -euo pipefail

cd "$(dirname "$0")/.."

ARQUIVOS=(manifest.json popup.html popup.js style.css gecko.svg icons)

VERSAO=$(jq -r '.version' manifest.json)
if [[ -z "$VERSAO" || "$VERSAO" == "null" ]]; then
  echo "Erro: não foi possível ler a versão do manifest.json" >&2
  exit 1
fi

# Confere se todo arquivo citado no manifest existe e entra no pacote.
while IFS= read -r caminho; do
  if [[ ! -f "$caminho" ]]; then
    echo "Erro: manifest.json cita '$caminho', que não existe" >&2
    exit 1
  fi
done < <(jq -r '[.icons[]?, .action.default_icon[]?, .action.default_popup] | .[]' manifest.json)

mkdir -p dist
ZIP="dist/CriptoPrice-${VERSAO}.zip"
rm -f "$ZIP"
zip -q -X -r "$ZIP" "${ARQUIVOS[@]}"

echo "$ZIP"
