const API_URL = "https://api.coingecko.com/api/v3/simple/price";
const CRIPTOS = [
  { id: "bitcoin", nome: "Bitcoin", simbolo: "BTC" },
  { id: "ethereum", nome: "Ethereum", simbolo: "ETH" },
  { id: "solana", nome: "Solana", simbolo: "SOL" },
  { id: "tether", nome: "Tether", simbolo: "USDT" },
];
const MOEDAS = ["brl", "usd"];
const CHAVE_MOEDA = "criptoprice:moeda";
const CHAVE_CACHE = "criptoprice:cache";
const CACHE_TTL_MS = 60 * 1000;

const formatadores = {
  brl: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
  usd: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
};
const formatadorVariacao = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const formatadorHora = new Intl.DateTimeFormat("pt-BR", { timeStyle: "medium" });

const elementos = {
  lista: document.getElementById("lista"),
  moedaAtual: document.getElementById("moeda-atual"),
  botaoTrocar: document.getElementById("botaoTrocar"),
  botaoAtualizar: document.getElementById("botaoAtualizar"),
  erro: document.getElementById("erro"),
  atualizado: document.getElementById("atualizado"),
};

let precos = null;
let atualizadoEm = null;
let carregando = false;
let moedaAtual = lerStorage(CHAVE_MOEDA, (v) => (MOEDAS.includes(v) ? v : null)) ?? "brl";

// ---------- armazenamento ----------

function lerStorage(chave, validar) {
  try {
    return validar(localStorage.getItem(chave));
  } catch {
    return null;
  }
}

function gravarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Armazenamento indisponível: segue sem lembrar o valor.
  }
}

function lerCache() {
  return lerStorage(CHAVE_CACHE, (bruto) => {
    const cache = JSON.parse(bruto);
    return cache && typeof cache.timestamp === "number" && cache.dados ? cache : null;
  });
}

// ---------- API ----------

async function buscarPrecos() {
  const params = new URLSearchParams({
    ids: CRIPTOS.map((c) => c.id).join(","),
    vs_currencies: MOEDAS.join(","),
    include_24hr_change: "true",
  });
  const response = await fetch(`${API_URL}?${params}`);

  if (response.status === 429) {
    throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
  }
  if (!response.ok) {
    throw new Error(`Erro ao consultar a CoinGecko (HTTP ${response.status}).`);
  }
  return response.json();
}

// ---------- interface ----------

function criarCartoes() {
  CRIPTOS.forEach(({ id, nome, simbolo }) => {
    const cartao = document.createElement("div");
    cartao.className = "crypto";
    cartao.innerHTML = `
      <div class="crypto-info">
        <h3></h3>
        <span class="simbolo"></span>
      </div>
      <div class="crypto-valores">
        <p class="preco" id="preco-${id}">Carregando...</p>
        <span class="variacao" id="variacao-${id}"></span>
      </div>`;
    cartao.querySelector("h3").textContent = nome;
    cartao.querySelector(".simbolo").textContent = simbolo;
    elementos.lista.appendChild(cartao);
  });
}

function renderizar() {
  elementos.moedaAtual.textContent = moedaAtual.toUpperCase();

  CRIPTOS.forEach(({ id }) => {
    const elPreco = document.getElementById(`preco-${id}`);
    const elVariacao = document.getElementById(`variacao-${id}`);
    const preco = precos?.[id]?.[moedaAtual];
    const variacao = precos?.[id]?.[`${moedaAtual}_24h_change`];

    if (typeof preco === "number") {
      elPreco.textContent = formatadores[moedaAtual].format(preco);
    } else if (precos) {
      elPreco.textContent = "Indisponível";
    }

    if (typeof variacao === "number") {
      elVariacao.textContent = `${formatadorVariacao.format(variacao)}%`;
      elVariacao.title = "Variação em 24h";
      elVariacao.className = `variacao ${variacao > 0 ? "alta" : variacao < 0 ? "baixa" : ""}`;
    } else {
      elVariacao.textContent = "";
      elVariacao.className = "variacao";
    }
  });

  elementos.atualizado.textContent = atualizadoEm
    ? `Atualizado às ${formatadorHora.format(atualizadoEm)}`
    : "";
}

function mostrarErro(mensagem) {
  elementos.erro.textContent = mensagem;
  elementos.erro.hidden = !mensagem;
}

function definirCarregando(valor) {
  carregando = valor;
  elementos.botaoAtualizar.disabled = valor;
  elementos.botaoAtualizar.classList.toggle("girando", valor);
}

// ---------- fluxo ----------

async function carregar({ forcar = false } = {}) {
  if (carregando) return;

  const cache = lerCache();
  if (cache) {
    precos = cache.dados;
    atualizadoEm = new Date(cache.timestamp);
    renderizar();
    if (!forcar && Date.now() - cache.timestamp < CACHE_TTL_MS) return;
  }

  definirCarregando(true);
  try {
    const dados = await buscarPrecos();
    precos = dados;
    atualizadoEm = new Date();
    gravarStorage(CHAVE_CACHE, JSON.stringify({ timestamp: atualizadoEm.getTime(), dados }));
    mostrarErro("");
    renderizar();
  } catch (error) {
    console.error("Erro ao carregar preços:", error);
    let mensagem =
      error instanceof TypeError
        ? "Sem conexão com a CoinGecko. Verifique sua internet."
        : error.message;
    if (precos) {
      mensagem += " Exibindo os últimos preços salvos.";
    } else {
      CRIPTOS.forEach(({ id }) => {
        document.getElementById(`preco-${id}`).textContent = "—";
      });
    }
    mostrarErro(mensagem);
  } finally {
    definirCarregando(false);
  }
}

elementos.botaoTrocar.addEventListener("click", () => {
  moedaAtual = moedaAtual === "brl" ? "usd" : "brl";
  gravarStorage(CHAVE_MOEDA, moedaAtual);
  renderizar();
});

elementos.botaoAtualizar.addEventListener("click", () => carregar({ forcar: true }));

criarCartoes();
renderizar();
carregar();
