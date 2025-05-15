async function getPreco(cripto, moeda) {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cripto}&vs_currencies=${moeda}`);
    const data = await response.json();
    const preco = data[cripto][moeda];
      
    // Formata e insere no elemento com ID `preco-cripto-moeda`
    const idElemento = `preco-${cripto}-${moeda}`;
    const elemento = document.getElementById(idElemento);
    if (elemento) {
      const prefixo = moeda === "brl" ? "R$" : moeda === "usd" ? "$" : `${moeda.toUpperCase()} `;
      elemento.textContent = `${prefixo} ${preco.toLocaleString("pt-BR")}`;
    }
  } catch (error) {
    console.error(`Erro ao carregar ${cripto}/${moeda}:`, error);
  }
}


// Criptos suportadas
const criptos = ["bitcoin", "ethereum"];
const moedas = ["brl", "usd"];

// Carregar todos os preços inicialmente
criptos.forEach((cripto) => {
  moedas.forEach((moeda) => getPreco(cripto, moeda));
});

let moedaAtual = "brl";

// Trocar a exibição de moeda
document.getElementById("botaoTrocar").addEventListener("click", () => {
  moedaAtual = moedaAtual === "brl" ? "usd" : "brl";

  // Mostrar só os elementos com data-moeda = moedaAtual
  document.querySelectorAll(".crypto").forEach((el) => {
    if (el.getAttribute("data-moeda") === moedaAtual) {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });
});

// Mostrar só BRL por padrão
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".crypto").forEach((el) => {
    el.style.display = el.getAttribute("data-moeda") === "brl" ? "block" : "none";
  });
});

(async () => {
  await getPreco("bitcoin", "usd");
})();

(async () => {
  await getPreco("bitcoin", "brl");
})();

(async () => {
  await getPreco("ethereum", "usd");
})();

(async () => {
  await getPreco("ethereum", "brl");
})();