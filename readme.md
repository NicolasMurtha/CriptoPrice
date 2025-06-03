# 💸 Crypto Prices Extension

![Badge](https://img.shields.io/badge/status-working-brightgreen)  
Uma extensão leve de navegador que exibe o preço de criptomoedas em tempo real usando a API da [CoinGecko](https://www.coingecko.com/).  
👀 Ideal para quem quer acompanhar rapidamente o valor de **Bitcoin**, **Ethereum** e outras moedas em **BRL** ou **USD**.

Agora disponível oficialmente na Chrome Web Store
https://chromewebstore.google.com/detail/criptoprice/jbagdmhabgekcnichjjpbfneicoabjmh

---

## 🛠️ Tecnologias utilizadas

- 🧠 **JavaScript** (ES6)
- 🎨 **HTML5** + **CSS3**
- 🔁 **API pública da CoinGecko**
- 🧩 **Manifest V3** para extensões do Chrome

---

## 🖼️ Interface

A interface mostra:

- 💰 Preço atual do Bitcoin e Ethereum
- 🇺🇸 / 🇧🇷 Alternância entre **USD** e **BRL**
- 🔄 Botão de troca de moeda
- 📉 Atualização automática dos preços ao abrir o popup

---

## 📦 Instalação

### 1. Clone o projeto:

```bash
git clone https://github.com/seu-usuario/crypto-extension.git
```

### 2. Acesse a pasta:

```bash
cd crypto-extension
```

### 3. Instale no Chrome:

1. Acesse `chrome://extensions`
2. Ative **Modo do desenvolvedor** (no topo direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta do projeto

---

## 🚀 Como usar

1. Clique no ícone da extensão no navegador
2. Veja os preços em tempo real
3. Use o botão ↔️ para alternar entre **USD** e **BRL**

---

## 🧪 Exemplo de estrutura do projeto

```
📁 crypto-extension/
│
├── popup.html       # Interface principal
├── style.css        # Estilização da interface
├── popup.js         # Lógica de troca de moeda e chamadas à API
├── manifest.json    # Configuração da extensão
├── assets/          # Ícones ou logos opcionais
└── README.md
```

---

## 🐸 API usada

> [CoinGecko](https://www.coingecko.com/en/api) — Gratuita, sem necessidade de autenticação.

---

## 🤝 Contribuições

Sinta-se livre para abrir **issues**, enviar **PRs** ou sugerir melhorias!

---

## 🪪 Licença

MIT © Nicolas Andre Murtha

---
