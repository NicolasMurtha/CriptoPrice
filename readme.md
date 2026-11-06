# 💸 CriptoPrice

![Status](https://img.shields.io/badge/status-working-brightgreen)
![Versão](https://img.shields.io/badge/versão-1.2.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)

Uma extensão leve de navegador que mostra o preço e a variação em 24h do **Bitcoin**, **Ethereum**, **Solana** e **Tether (USDT)** em **BRL** ou **USD**, usando a API pública da [CoinGecko](https://www.coingecko.com/).

🚀 Disponível na [Chrome Web Store](https://chromewebstore.google.com/detail/criptoprice/jbagdmhabgekcnichjjpbfneicoabjmh).

---

## ✨ Funcionalidades

- 💰 Preço atual de BTC, ETH, SOL e USDT
- 📈 Variação em 24h, em verde (alta) ou vermelho (baixa)
- 🔄 Botão para atualizar os preços na hora
- ⏱️ Cache de 60 segundos: reabrir o popup logo em seguida não gasta requisições
- 🇧🇷 / 🇺🇸 Alternância entre **BRL** e **USD** com o botão ↔️
- 💾 A moeda escolhida fica salva para a próxima vez
- 🔢 Valores formatados no padrão de cada moeda (`R$ 543.210,50` / `$98,765.40`)
- ⚠️ Mensagem clara quando a API está fora do ar, sem internet ou com limite de requisições atingido; se houver preços salvos, eles continuam na tela
- 🔒 Nenhuma permissão solicitada ao navegador

---

## 🛠️ Tecnologias

- **JavaScript** puro (sem dependências nem build)
- **HTML5** + **CSS3**
- **API pública da CoinGecko** (sem chave)
- **Manifest V3** do Chrome

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

---

## 🚀 Como usar

1. Clique no ícone do CriptoPrice na barra do navegador
2. Veja os preços e a variação em 24h
3. Use o botão ↔️ para alternar entre **BRL** e **USD**
4. Use o botão 🔄 para buscar os preços novamente

---

## 📁 Estrutura do projeto

```
CriptoPrice/
├── manifest.json   # Configuração da extensão (Manifest V3)
├── popup.html      # Interface do popup
├── popup.js        # Busca dos preços, cache, formatação e troca de moeda
├── style.css       # Estilos do popup
├── icon.png        # Ícone original (256×256)
├── icons/          # Ícones redimensionados (16, 32, 48, 128 px)
├── gecko.svg       # Logo da CoinGecko (crédito obrigatório)
└── LICENSE
```

---

## 🐸 API usada

[CoinGecko](https://www.coingecko.com/en/api): plano público, sem autenticação. A extensão faz **uma única requisição** para todas as moedas:

```
GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=brl,usd&include_24hr_change=true
```

A resposta fica em cache por 60 segundos (no `localStorage` da extensão). Dentro desse prazo, abrir o popup não faz nova requisição; o botão 🔄 ignora o cache.

O plano gratuito limita o número de requisições por minuto. Se o limite for atingido, a extensão mostra um aviso e basta tentar de novo em instantes.

---

## 📝 Changelog

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
