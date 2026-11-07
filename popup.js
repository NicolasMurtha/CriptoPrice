import {
  CATALOGO,
  MOEDAS,
  INTERVALO_MIN_ATUALIZAR_MS,
  normalizarSelecao,
  formatarPreco,
  formatarVariacao,
  classeVariacao,
  cacheServe,
  converterMercado,
  caminhoSparkline,
  tendencia,
  mesmoDia,
} from "./lib.js";

const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const EMAIL_CONTATO = "nickymurtha@gmail.com";
const CHAVES = {
  moeda: "criptoprice:moeda",
  selecao: "criptoprice:selecao",
  cache: "criptoprice:cache:v2",
};
const SPARK_LARGURA = 56;
const SPARK_ALTURA = 22;

// ---------- idioma ----------

const i18n = globalThis.chrome?.i18n;
const idioma = i18n?.getUILanguage?.() || navigator.language || "pt-BR";

function t(chave, ...substituicoes) {
  return i18n?.getMessage(chave, substituicoes.map(String)) || chave;
}

function traduzirPagina() {
  document.documentElement.lang = idioma;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
    el.setAttribute("aria-label", el.title);
  });
}

// ---------- armazenamento (localStorage: não exige permissão) ----------

function ler(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave));
  } catch {
    return null;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível: segue sem lembrar.
  }
}

// ---------- estado ----------

const el = {
  lista: document.getElementById("lista"),
  opcoes: document.getElementById("opcoes"),
  precos: document.getElementById("precos"),
  config: document.getElementById("config"),
  moedaAtual: document.getElementById("moeda-atual"),
  erro: document.getElementById("erro"),
  atualizado: document.getElementById("atualizado"),
  botaoAtualizar: document.getElementById("botaoAtualizar"),
  botaoTrocar: document.getElementById("botaoTrocar"),
  botaoConfig: document.getElementById("botaoConfig"),
  botaoConcluir: document.getElementById("botaoConcluir"),
  botaoContato: document.getElementById("botaoContato"),
};

const estado = {
  moeda: MOEDAS.includes(ler(CHAVES.moeda))
    ? ler(CHAVES.moeda)
    : idioma.toLowerCase().startsWith("pt")
      ? "brl"
      : "usd",
  selecao: normalizarSelecao(ler(CHAVES.selecao)),
  cache: ler(CHAVES.cache) || {},
  carregando: new Set(),
  falhou: new Set(), // moedas cuja última busca falhou (sem dados mostra "—")
  bloqueioAtualizar: null,
};

// Remove o cache da versão 1.x, que tinha outro formato.
try {
  localStorage.removeItem("criptoprice:cache");
} catch {
  // ignora
}

// ---------- API ----------

class ErroApi extends Error {
  constructor(chave, ...substituicoes) {
    super(chave);
    this.chave = chave;
    this.substituicoes = substituicoes;
  }
}

async function buscarMercado(moeda, ids) {
  const params = new URLSearchParams({
    vs_currency: moeda,
    ids: ids.join(","),
    sparkline: "true",
    price_change_percentage: "24h",
  });
  let response;
  try {
    response = await fetch(`${API_URL}?${params}`);
  } catch {
    throw new ErroApi("errNetwork");
  }
  if (response.status === 429) throw new ErroApi("errRateLimit");
  if (!response.ok) throw new ErroApi("errHttp", response.status);
  return converterMercado(await response.json());
}

// ---------- renderização ----------

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function criarIcone(moeda) {
  const img = criarElemento("img", "icone");
  img.src = `icons/coins/${moeda.icone}.svg`;
  img.alt = "";
  img.width = 28;
  img.height = 28;
  return img;
}

function criarSparkline(serie) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", `spark ${tendencia(serie)}`);
  svg.setAttribute("viewBox", `0 0 ${SPARK_LARGURA} ${SPARK_ALTURA}`);
  svg.setAttribute("width", SPARK_LARGURA);
  svg.setAttribute("height", SPARK_ALTURA);
  svg.setAttribute("aria-hidden", "true");
  const titulo = document.createElementNS(ns, "title");
  titulo.textContent = t("trend7d");
  svg.appendChild(titulo);
  const d = caminhoSparkline(serie, SPARK_LARGURA, SPARK_ALTURA);
  if (d) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  }
  return svg;
}

function renderizarPrecos() {
  el.moedaAtual.textContent = estado.moeda.toUpperCase();
  const entrada = estado.cache[estado.moeda];
  const dados = entrada?.dados;

  el.lista.replaceChildren(
    ...estado.selecao.map((id) => {
      const moeda = CATALOGO.find((c) => c.id === id);
      const info = dados?.[id];
      const item = criarElemento("li", "moeda");

      const nome = criarElemento("div", "nome");
      nome.append(criarElemento("span", "nome-moeda", moeda.nome), criarElemento("span", "simbolo", moeda.simbolo));

      const valores = criarElemento("div", "valores");
      let textoPreco = estado.falhou.has(estado.moeda) ? "—" : t("loading");
      if (typeof info?.preco === "number") textoPreco = formatarPreco(info.preco, estado.moeda);
      else if (info) textoPreco = t("unavailable");
      valores.append(criarElemento("span", "preco", textoPreco));

      if (typeof info?.variacao24h === "number") {
        const variacao = criarElemento(
          "span",
          `variacao ${classeVariacao(info.variacao24h)}`,
          formatarVariacao(info.variacao24h, idioma),
        );
        variacao.title = t("change24h");
        valores.append(variacao);
      }

      item.append(criarIcone(moeda), nome, criarSparkline(info?.sparkline), valores);
      return item;
    }),
  );

  if (entrada?.timestamp) {
    const data = new Date(entrada.timestamp);
    const hora = data.toLocaleTimeString(idioma, { hour: "2-digit", minute: "2-digit" });
    el.atualizado.textContent = mesmoDia(data, new Date())
      ? t("updatedAt", hora)
      : t("updatedAtDate", data.toLocaleDateString(idioma, { day: "2-digit", month: "2-digit" }), hora);
  } else {
    el.atualizado.textContent = "";
  }
}

function renderizarOpcoes() {
  el.opcoes.replaceChildren(
    ...CATALOGO.map((moeda) => {
      const item = criarElemento("li");
      const rotulo = criarElemento("label", "opcao");
      const caixa = document.createElement("input");
      caixa.type = "checkbox";
      caixa.value = moeda.id;
      caixa.checked = estado.selecao.includes(moeda.id);
      caixa.addEventListener("change", aoMudarSelecao);
      rotulo.append(caixa, criarIcone(moeda), criarElemento("span", "nome-moeda", moeda.nome), criarElemento("span", "simbolo", moeda.simbolo));
      item.append(rotulo);
      return item;
    }),
  );
}

function mostrarErro(mensagem) {
  el.erro.textContent = mensagem;
  el.erro.hidden = !mensagem;
}

function atualizarBotaoAtualizar() {
  const ocupado = estado.carregando.has(estado.moeda);
  el.botaoAtualizar.classList.toggle("girando", ocupado);
  el.botaoAtualizar.disabled = ocupado || estado.bloqueioAtualizar !== null;
  el.botaoAtualizar.title = estado.bloqueioAtualizar !== null && !ocupado ? t("waitRefresh") : t("btnRefresh");
}

// ---------- fluxo ----------

async function carregar({ forcar = false } = {}) {
  const moeda = estado.moeda;
  const ids = estado.selecao;
  const agora = Date.now();
  const entrada = estado.cache[moeda];

  if (!forcar && cacheServe(entrada, ids, agora, true)) {
    mostrarErro("");
    return;
  }
  if (estado.carregando.has(moeda)) return;

  estado.carregando.add(moeda);
  atualizarBotaoAtualizar();
  try {
    const dados = await buscarMercado(moeda, ids);
    estado.cache[moeda] = { timestamp: Date.now(), dados };
    gravar(CHAVES.cache, estado.cache);
    if (estado.moeda === moeda) mostrarErro("");
    estado.falhou.delete(moeda);
  } catch (erro) {
    estado.falhou.add(moeda);
    console.error("Erro ao carregar preços:", erro);
    if (estado.moeda === moeda) {
      let mensagem = erro instanceof ErroApi ? t(erro.chave, ...erro.substituicoes) : t("errNetwork");
      if (cacheServe(estado.cache[moeda], ids, Date.now(), false)) mensagem += ` ${t("staleSuffix")}`;
      mostrarErro(mensagem);
    }
  } finally {
    estado.carregando.delete(moeda);
    if (estado.moeda === moeda) renderizarPrecos();
    atualizarBotaoAtualizar();
  }
}

function aoMudarSelecao(evento) {
  const marcadas = [...el.opcoes.querySelectorAll("input:checked")].map((c) => c.value);
  if (marcadas.length === 0) {
    evento.target.checked = true;
    el.config.querySelector(".dica").classList.add("destaque");
    return;
  }
  el.config.querySelector(".dica").classList.remove("destaque");
  estado.selecao = normalizarSelecao(marcadas);
  gravar(CHAVES.selecao, estado.selecao);
}

function abrirConfig(abrir) {
  el.config.hidden = !abrir;
  el.precos.hidden = abrir;
  el.botaoConfig.setAttribute("aria-expanded", String(abrir));
  el.botaoConfig.classList.toggle("ativo", abrir);
  if (abrir) {
    renderizarOpcoes();
  } else {
    renderizarPrecos();
    carregar();
  }
}

// ---------- eventos ----------

el.botaoTrocar.addEventListener("click", () => {
  estado.moeda = estado.moeda === "brl" ? "usd" : "brl";
  gravar(CHAVES.moeda, estado.moeda);
  mostrarErro("");
  renderizarPrecos();
  atualizarBotaoAtualizar();
  carregar();
});

el.botaoAtualizar.addEventListener("click", () => {
  if (estado.bloqueioAtualizar !== null) return;
  estado.bloqueioAtualizar = setTimeout(() => {
    estado.bloqueioAtualizar = null;
    atualizarBotaoAtualizar();
  }, INTERVALO_MIN_ATUALIZAR_MS);
  carregar({ forcar: true });
});

el.botaoConfig.addEventListener("click", () => abrirConfig(el.config.hidden));
el.botaoConcluir.addEventListener("click", () => abrirConfig(false));

el.botaoContato.addEventListener("click", () => {
  const versao = globalThis.chrome?.runtime?.getManifest?.().version ?? "";
  const url = `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(`CriptoPrice ${versao}`.trim())}`;
  // chrome.tabs.create não exige permissão; fora da extensão, usa window.open.
  if (globalThis.chrome?.tabs?.create) chrome.tabs.create({ url });
  else window.open(url);
});

// ---------- início ----------

traduzirPagina();
renderizarPrecos();
atualizarBotaoAtualizar();
carregar();
