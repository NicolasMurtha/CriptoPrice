const API_URL = "https://api.coingecko.com/api/v3/simple/price";
const CRIPTOS = ["bitcoin", "ethereum"];
const MOEDAS = ["brl", "usd"];
const CHAVE_MOEDA = "criptoprice:moeda";

const formatadores = {
  brl: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
  usd: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
};

let precos = null;
let moedaAtual = lerMoedaSalva();

function lerMoedaSalva() {
  try {
    const salva = localStorage.getItem(CHAVE_MOEDA);
    return MOEDAS.includes(salva) ? salva : "brl";
  } catch {
    return "brl";
  }
}

function salvarMoeda(moeda) {
  try {
    localStorage.setItem(CHAVE_MOEDA, moeda);
  } catch {
    // Armazenamento indisponível: a escolha só não será lembrada.
  }
}

async function buscarPrecos() {
  const params = new URLSearchParams({
    ids: CRIPTOS.join(","),
    vs_currencies: MOEDAS.join(","),
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

function renderizar() {
  document.getElementById("moeda-atual").textContent = moedaAtual.toUpperCase();

  CRIPTOS.forEach((cripto) => {
    const elemento = document.getElementById(`preco-${cripto}`);
    const preco = precos?.[cripto]?.[moedaAtual];
    if (typeof preco === "number") {
      elemento.textContent = formatadores[moedaAtual].format(preco);
    } else if (precos) {
      elemento.textContent = "Indisponível";
    }
  });
}

function mostrarErro(mensagem) {
  const erro = document.getElementById("erro");
  erro.textContent = mensagem;
  erro.hidden = false;
  CRIPTOS.forEach((cripto) => {
    document.getElementById(`preco-${cripto}`).textContent = "—";
  });
}

async function carregar() {
  try {
    precos = await buscarPrecos();
    renderizar();
  } catch (error) {
    console.error("Erro ao carregar preços:", error);
    const mensagem =
      error instanceof TypeError
        ? "Sem conexão com a CoinGecko. Verifique sua internet."
        : error.message;
    mostrarErro(mensagem);
  }
}

document.getElementById("botaoTrocar").addEventListener("click", () => {
  moedaAtual = moedaAtual === "brl" ? "usd" : "brl";
  salvarMoeda(moedaAtual);
  renderizar();
});

renderizar();
carregar();
