# 💸 CriptoPrice

![Status](https://img.shields.io/badge/status-working-brightgreen)
![Versão](https://img.shields.io/badge/versão-1.1.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)

Uma extensão leve de navegador que mostra o preço atual do **Bitcoin** e do **Ethereum** em **BRL** ou **USD**, usando a API pública da [CoinGecko](https://www.coingecko.com/).

🚀 Disponível na [Chrome Web Store](https://chromewebstore.google.com/detail/criptoprice/jbagdmhabgekcnichjjpbfneicoabjmh).

---

## ✨ Funcionalidades

- 💰 Preço atual do Bitcoin e do Ethereum, buscado ao abrir o popup
- 🇧🇷 / 🇺🇸 Alternância entre **BRL** e **USD** com o botão ↔️
- 💾 A moeda escolhida fica salva para a próxima vez
- 🔢 Valores formatados no padrão de cada moeda (`R$ 543.210,50` / `$98,765.40`)
- ⚠️ Mensagem clara quando a API está fora do ar, sem internet ou com limite de requisições atingido
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
2. Veja os preços atuais
3. Use o botão ↔️ para alternar entre **BRL** e **USD**

---

## 📁 Estrutura do projeto

```
CriptoPrice/
├── manifest.json   # Configuração da extensão (Manifest V3)
├── popup.html      # Interface do popup
├── popup.js        # Busca dos preços, formatação e troca de moeda
├── style.css       # Estilos do popup
├── icon.png        # Ícone original (256×256)
├── icons/          # Ícones redimensionados (16, 32, 48, 128 px)
├── gecko.svg       # Logo da CoinGecko (crédito obrigatório)
└── LICENSE
```

---

## 🐸 API usada

[CoinGecko](https://www.coingecko.com/en/api): plano público, sem autenticação. A extensão faz **uma única requisição** por abertura do popup:

```
GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl,usd
```

O plano gratuito limita o número de requisições por minuto. Se o limite for atingido, a extensão mostra um aviso e basta tentar de novo em instantes.

---

## 📝 Changelog

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
