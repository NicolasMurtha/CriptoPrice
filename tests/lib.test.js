import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  CATALOGO,
  PADRAO_SELECIONADAS,
  CACHE_TTL_MS,
  normalizarSelecao,
  formatarPreco,
  formatarVariacao,
  classeVariacao,
  cacheServe,
  converterMercado,
  caminhoSparkline,
  tendencia,
  mesmoDia,
} from "../lib.js";

// Intl usa espaço não separável entre "R$" e o número.
const semNbsp = (s) => s.replace(/ /g, " ");

test("catálogo: ids únicos e ícone existente para cada moeda", () => {
  const ids = CATALOGO.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of CATALOGO) {
    assert.ok(existsSync(new URL(`../icons/coins/${c.icone}.svg`, import.meta.url)), c.icone);
  }
  for (const id of PADRAO_SELECIONADAS) assert.ok(ids.includes(id));
});

test("normalizarSelecao: filtra, remove repetidos, ordena e nunca fica vazia", () => {
  assert.deepEqual(normalizarSelecao(["solana", "bitcoin", "solana", "xyz"]), ["bitcoin", "solana"]);
  assert.deepEqual(normalizarSelecao([]), PADRAO_SELECIONADAS);
  assert.deepEqual(normalizarSelecao(null), PADRAO_SELECIONADAS);
  assert.deepEqual(normalizarSelecao("bitcoin"), PADRAO_SELECIONADAS);
});

test("formatarPreco: padrão de cada moeda", () => {
  assert.equal(semNbsp(formatarPreco(543210.5, "brl")), "R$ 543.210,50");
  assert.equal(formatarPreco(98765.4, "usd"), "$98,765.40");
  assert.equal(semNbsp(formatarPreco(5.4, "brl")), "R$ 5,40");
});

test("formatarPreco: valores abaixo de 1 não viram zero", () => {
  assert.equal(semNbsp(formatarPreco(0.00012345, "brl")), "R$ 0,0001235");
  assert.equal(formatarPreco(0.5, "usd"), "$0.50");
  assert.equal(formatarPreco(0.1234, "usd"), "$0.1234");
});

test("variação: texto e cor seguem o valor arredondado", () => {
  assert.equal(formatarVariacao(2.345, "pt-BR"), "+2,35%");
  assert.equal(formatarVariacao(-1.2, "en"), "-1.20%");
  assert.equal(formatarVariacao(0.004, "pt-BR"), "0,00%");
  assert.equal(formatarVariacao(-0.004, "pt-BR"), "0,00%");
  assert.equal(classeVariacao(0.004), "");
  assert.equal(classeVariacao(-0.004), "");
  assert.equal(classeVariacao(0.005), "alta");
  assert.equal(classeVariacao(-0.02), "baixa");
});

test("cacheServe: exige todos os ids e, se pedido, frescor", () => {
  const agora = 1_000_000;
  const entrada = { timestamp: agora - 1000, dados: { bitcoin: {}, ethereum: {} } };
  assert.equal(cacheServe(entrada, ["bitcoin"], agora), true);
  assert.equal(cacheServe(entrada, ["bitcoin", "solana"], agora), false);
  const velha = { ...entrada, timestamp: agora - CACHE_TTL_MS - 1 };
  assert.equal(cacheServe(velha, ["bitcoin"], agora), false);
  assert.equal(cacheServe(velha, ["bitcoin"], agora, false), true);
  assert.equal(cacheServe(null, ["bitcoin"], agora), false);
  assert.equal(cacheServe({ dados: {} }, [], agora), false);
});

test("converterMercado: lê preço, variação e sparkline da CoinGecko", () => {
  const dados = converterMercado([
    {
      id: "bitcoin",
      current_price: 100,
      price_change_percentage_24h: 1,
      price_change_percentage_24h_in_currency: 1.5,
      sparkline_in_7d: { price: [1, 2, null, 3] },
    },
    { id: "ethereum", current_price: null, price_change_percentage_24h: -2 },
    { semId: true },
  ]);
  assert.deepEqual(dados.bitcoin, { preco: 100, variacao24h: 1.5, sparkline: [1, 2, 3] });
  assert.deepEqual(dados.ethereum, { preco: null, variacao24h: -2, sparkline: [] });
  assert.equal(Object.keys(dados).length, 2);
  assert.deepEqual(converterMercado({ error: "x" }), {});
});

test("caminhoSparkline: cabe na área e começa/termina nas bordas", () => {
  const serie = Array.from({ length: 168 }, (_, i) => Math.sin(i / 10) * 50 + 100);
  const d = caminhoSparkline(serie, 56, 22);
  const pontos = [...d.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  assert.ok(pontos.length <= 44);
  assert.equal(pontos[0][0], 0);
  assert.equal(pontos.at(-1)[0], 56);
  for (const [x, y] of pontos) {
    assert.ok(x >= 0 && x <= 56);
    assert.ok(y >= 0 && y <= 22);
  }
  assert.equal(caminhoSparkline([1], 56, 22), null);
  assert.equal(caminhoSparkline(undefined, 56, 22), null);
  assert.ok(caminhoSparkline([5, 5, 5], 56, 22)); // série constante não divide por zero
});

test("tendencia e mesmoDia", () => {
  assert.equal(tendencia([1, 3]), "alta");
  assert.equal(tendencia([3, 1]), "baixa");
  assert.equal(tendencia([2, 2]), "");
  assert.equal(tendencia([]), "");
  assert.equal(mesmoDia(new Date(2026, 10, 7, 1), new Date(2026, 10, 7, 23)), true);
  assert.equal(mesmoDia(new Date(2026, 10, 6, 23), new Date(2026, 10, 7, 1)), false);
});

test("traduções: mesmas chaves em todos os idiomas e descrição dentro do limite da loja", () => {
  const ler = (l) => JSON.parse(readFileSync(new URL(`../_locales/${l}/messages.json`, import.meta.url)));
  const en = ler("en");
  for (const l of ["pt_BR", "pt_PT"]) {
    assert.deepEqual(Object.keys(ler(l)).sort(), Object.keys(en).sort(), l);
    assert.ok(ler(l).extDescription.message.length <= 132);
  }
  assert.ok(en.extDescription.message.length <= 132);
});

test("manifest: sem permissões", () => {
  const manifest = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url)));
  assert.deepEqual(manifest.permissions, []);
  assert.equal(manifest.host_permissions, undefined);
});
