// Funções puras do CriptoPrice: sem DOM, sem rede, sem armazenamento.
// Testadas em tests/lib.test.js.

/** Moedas que o usuário pode escolher. `id` é o identificador da CoinGecko. */
export const CATALOGO = [
  { id: "bitcoin", nome: "Bitcoin", simbolo: "BTC", icone: "btc" },
  { id: "ethereum", nome: "Ethereum", simbolo: "ETH", icone: "eth" },
  { id: "tether", nome: "Tether", simbolo: "USDT", icone: "usdt" },
  { id: "binancecoin", nome: "BNB", simbolo: "BNB", icone: "bnb" },
  { id: "solana", nome: "Solana", simbolo: "SOL", icone: "sol" },
  { id: "ripple", nome: "XRP", simbolo: "XRP", icone: "xrp" },
  { id: "usd-coin", nome: "USD Coin", simbolo: "USDC", icone: "usdc" },
  { id: "cardano", nome: "Cardano", simbolo: "ADA", icone: "ada" },
  { id: "dogecoin", nome: "Dogecoin", simbolo: "DOGE", icone: "doge" },
  { id: "tron", nome: "TRON", simbolo: "TRX", icone: "trx" },
  { id: "avalanche-2", nome: "Avalanche", simbolo: "AVAX", icone: "avax" },
  { id: "chainlink", nome: "Chainlink", simbolo: "LINK", icone: "link" },
  { id: "polkadot", nome: "Polkadot", simbolo: "DOT", icone: "dot" },
  { id: "litecoin", nome: "Litecoin", simbolo: "LTC", icone: "ltc" },
  { id: "stellar", nome: "Stellar", simbolo: "XLM", icone: "xlm" },
];

export const PADRAO_SELECIONADAS = ["bitcoin", "ethereum", "solana", "tether"];
export const MOEDAS = ["brl", "usd"];
export const CACHE_TTL_MS = 60 * 1000;
export const INTERVALO_MIN_ATUALIZAR_MS = 15 * 1000;

const LOCALE_DA_MOEDA = { brl: "pt-BR", usd: "en-US" };

/** Mantém só ids conhecidos, sem repetição, na ordem do catálogo. Nunca devolve lista vazia. */
export function normalizarSelecao(ids) {
  const validos = new Set(Array.isArray(ids) ? ids : []);
  const resultado = CATALOGO.map((c) => c.id).filter((id) => validos.has(id));
  return resultado.length ? resultado : [...PADRAO_SELECIONADAS];
}

/**
 * Formata um preço na moeda indicada. Valores abaixo de 1 ganham mais casas
 * decimais para não virarem "R$ 0,00".
 */
export function formatarPreco(valor, moeda) {
  const opcoes = { style: "currency", currency: moeda.toUpperCase() };
  const absoluto = Math.abs(valor);
  if (absoluto > 0 && absoluto < 1) {
    opcoes.minimumSignificantDigits = 2;
    opcoes.maximumSignificantDigits = 4;
  }
  return new Intl.NumberFormat(LOCALE_DA_MOEDA[moeda] ?? "en-US", opcoes).format(valor);
}

/** Arredonda a variação para 2 casas: o mesmo valor que aparece na tela. */
export function arredondarVariacao(variacao) {
  const arredondado = Math.round(variacao * 100) / 100;
  return Object.is(arredondado, -0) ? 0 : arredondado;
}

export function formatarVariacao(variacao, idioma) {
  const formatador = new Intl.NumberFormat(idioma, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  });
  return `${formatador.format(arredondarVariacao(variacao))}%`;
}

/** "alta", "baixa" ou "" — decidido pelo valor arredondado, igual ao exibido. */
export function classeVariacao(variacao) {
  const v = arredondarVariacao(variacao);
  return v > 0 ? "alta" : v < 0 ? "baixa" : "";
}

/**
 * Diz se o cache de uma moeda serve para as moedas selecionadas.
 * Precisa ter todos os ids pedidos e, se `exigirFresco`, ter menos de CACHE_TTL_MS.
 */
export function cacheServe(entrada, ids, agora, exigirFresco = true) {
  if (!entrada || typeof entrada.timestamp !== "number" || !entrada.dados) return false;
  if (!ids.every((id) => id in entrada.dados)) return false;
  return !exigirFresco || agora - entrada.timestamp < CACHE_TTL_MS;
}

/** Converte a resposta de /coins/markets em { id: { preco, variacao24h, sparkline } }. */
export function converterMercado(resposta) {
  const dados = {};
  for (const item of Array.isArray(resposta) ? resposta : []) {
    if (!item || typeof item.id !== "string") continue;
    const variacao =
      item.price_change_percentage_24h_in_currency ?? item.price_change_percentage_24h;
    const serie = item.sparkline_in_7d?.price;
    dados[item.id] = {
      preco: typeof item.current_price === "number" ? item.current_price : null,
      variacao24h: typeof variacao === "number" ? variacao : null,
      sparkline: Array.isArray(serie) ? serie.filter((p) => typeof p === "number") : [],
    };
  }
  return dados;
}

/**
 * Reduz a série a no máximo `pontos` valores e gera o atributo `d` de um <path> SVG
 * com largura x altura. Devolve null se não houver dados suficientes.
 */
export function caminhoSparkline(serie, largura, altura, pontos = 42) {
  if (!Array.isArray(serie) || serie.length < 2) return null;
  const passo = Math.max(1, Math.ceil(serie.length / pontos));
  const amostra = serie.filter((_, i) => i % passo === 0);
  if (amostra[amostra.length - 1] !== serie[serie.length - 1]) amostra.push(serie[serie.length - 1]);

  const min = Math.min(...amostra);
  const max = Math.max(...amostra);
  const faixa = max - min || 1;
  const margem = 1;
  const alturaUtil = altura - margem * 2;

  return amostra
    .map((valor, i) => {
      const x = (i / (amostra.length - 1)) * largura;
      const y = margem + alturaUtil - ((valor - min) / faixa) * alturaUtil;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Tendência da série de 7 dias: "alta", "baixa" ou "". */
export function tendencia(serie) {
  if (!Array.isArray(serie) || serie.length < 2) return "";
  const delta = serie[serie.length - 1] - serie[0];
  return delta > 0 ? "alta" : delta < 0 ? "baixa" : "";
}

/** Mesma data do calendário local? */
export function mesmoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
