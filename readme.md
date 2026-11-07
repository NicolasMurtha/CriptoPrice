# 💸 CriptoPrice

![Status](https://img.shields.io/badge/status-working-brightgreen)
![Versão](https://img.shields.io/badge/versão-2.0.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)
![Permissões](https://img.shields.io/badge/permissões-nenhuma-success)

Uma extensão leve de navegador que mostra a cotação das principais criptomoedas em **BRL** ou **USD**, com variação em 24h e gráfico dos últimos 7 dias, usando a API pública da [CoinGecko](https://www.coingecko.com/).

🚀 Disponível na [Chrome Web Store](https://chromewebstore.google.com/detail/criptoprice/jbagdmhabgekcnichjjpbfneicoabjmh).

---

## ✨ Funcionalidades

- 🪙 Ícone, nome e preço de cada moeda
- 🧩 Escolha quais moedas aparecem entre 15 opções (BTC, ETH, USDT, BNB, SOL, XRP, USDC, ADA, DOGE, TRX, AVAX, LINK, DOT, LTC e XLM)
- 📈 Variação em 24h, em verde (alta) ou vermelho (baixa)
- 📉 Mini gráfico dos últimos 7 dias
- 🇧🇷 / 🇺🇸 Alternância entre **BRL** e **USD**; a escolha fica salva
- 🔄 Botão para atualizar os preços (com intervalo mínimo de 15 s para não estourar o limite da API)
- ⏱️ Cache de 60 segundos por moeda: reabrir o popup logo em seguida não gasta requisições
- 🌙 Modo escuro automático, seguindo o tema do sistema
- 🌐 Interface em português e inglês, conforme o idioma do navegador
- ⚠️ Mensagem clara quando a API falha; se houver preços salvos, eles continuam na tela com data e hora
- ✉️ Botão de contato com o desenvolvedor
- 🔒 Nenhuma permissão solicitada ao navegador

---

## 🛠️ Tecnologias

- **JavaScript** puro com módulos ES (sem dependências nem build)
- **HTML5** + **CSS3**
- **API pública da CoinGecko** (sem chave)
- **Manifest V3** do Chrome, com `chrome.i18n` para os idiomas
- Ícones das moedas: [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons) (CC0)

---

## 📦 Instalação para desenvolvimento

1. Clone o projeto:

   ```bash
   git clone https://github.com/NicolasMurtha/CriptoPrice.git
   ```

2. No Chrome, acesse `chrome://extensions`
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação** e selecione a pasta `CriptoPrice`

Depois de alterar algum arquivo, clique no ícone de recarregar da extensão em `chrome://extensions` e reabra o popup.

Para rodar os testes (Node.js 20+): `npm test`.

Para gerar o pacote `.zip` da Chrome Web Store, rode `scripts/build.sh` (o arquivo vai para `dist/`) e envie-o pelo [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## 🚀 Como usar

1. Clique no ícone do CriptoPrice na barra do navegador
2. Veja os preços, a variação em 24h e o gráfico de 7 dias
3. Use o botão ↔️ para alternar entre **BRL** e **USD**
4. Use o botão ⚙️ para escolher as moedas
5. Use o botão 🔄 para buscar os preços novamente

---

## 📁 Estrutura do projeto

```
CriptoPrice/
├── manifest.json   # Configuração da extensão (Manifest V3)
├── popup.html      # Interface do popup
├── popup.js        # Interface: busca, cache, renderização e eventos
├── lib.js          # Funções puras (formatação, cache, gráfico), testadas
├── style.css       # Estilos, incluindo o modo escuro
├── _locales/       # Textos em português e inglês
├── icons/          # Ícones da extensão e icons/coins/ com os das moedas
├── gecko.svg       # Logo da CoinGecko (crédito obrigatório)
├── tests/          # Testes (node --test)
├── scripts/        # build.sh: gera o .zip para a Chrome Web Store
├── store/          # Textos e capturas de tela da página na Chrome Web Store
└── LICENSE
```

---

## 🐸 API usada

[CoinGecko](https://www.coingecko.com/en/api): plano público, sem autenticação. A extensão faz **uma única requisição** por moeda de exibição, com todas as criptomoedas escolhidas:

```
GET https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=bitcoin,ethereum,solana,tether&sparkline=true&price_change_percentage=24h
```

A resposta fica em cache por 60 segundos (no `localStorage` da extensão). Dentro desse prazo, abrir o popup não faz nova requisição; o botão 🔄 ignora o cache.

O plano gratuito limita o número de requisições por minuto. Se o limite for atingido, a extensão mostra um aviso e os últimos preços salvos.

---

## 📝 Changelog

### 2.0.0
- Ícone de cada moeda e escolha entre 15 criptomoedas
- Mini gráfico de 7 dias
- Modo escuro automático
- Interface em português e inglês (USD como padrão fora do português)
- Botão de contato
- Intervalo mínimo de 15 s entre atualizações manuais
- Valores abaixo de 1 com mais casas decimais (ex.: `$0.1594`)
- Cor da variação segue o valor exibido (0,00% fica neutro)
- Data na mensagem de "atualizado" quando os preços salvos não são de hoje
- Cache separado por moeda e invalidado quando faltam criptomoedas escolhidas
- Testes automatizados (`npm test`)

### 1.2.0
- Novas moedas: Solana (SOL) e Tether (USDT)
- Variação em 24h com cores de alta e baixa
- Botão para atualizar os preços
- Cache de 60 segundos e horário da última atualização
- Em caso de erro, os últimos preços salvos continuam visíveis

### 1.1.0
- Uma única requisição à API por abertura (antes eram 8)
- Mensagens de erro visíveis no popup
- Formatação correta para BRL e USD
- Moeda escolhida passa a ser lembrada
- Ícones em vários tamanhos no manifest
- Limpeza do HTML e do CSS

### 1.0
- Primeira versão publicada

---

## 🤝 Contribuições

Sinta-se livre para abrir **issues**, enviar **PRs** ou sugerir melhorias!

---

## 🪪 Licença

MIT © Nicolas Andre Murtha
