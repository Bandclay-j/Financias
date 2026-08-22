// 1. Trava de Segurança: redireciona imediatamente se não houver sessão ativa
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

if (!usuarioLogado) {
  window.location.href = './login.html';
}

const API_URL = 'http://localhost:8080/api/transacoes';

const form = document.getElementById('form-transacao');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const dataInput = document.getElementById('data');
const tipoSelect = document.getElementById('tipo');
const categoriaSelect = document.getElementById('categoria');
const filtroMesInput = document.getElementById('filtro-mes');
const listaTransacoes = document.getElementById('lista-transacoes');

const totalEntradasEl = document.getElementById('total-entradas');
const totalSaidasEl = document.getElementById('total-saidas');
const saldoTotalEl = document.getElementById('saldo-total');
const btnTema = document.getElementById('btn-tema');
const btnLogout = document.getElementById('btn-logout');

let meuGrafico = null;
let transacoes = [];

// Define data atual por padrão
const hoje = new Date();
dataInput.value = hoje.toISOString().split('T')[0];
filtroMesInput.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 2. READ: Buscar transações vinculadas exclusivamente ao ID do Usuário logado
async function carregarTransacoes() {
  if (!usuarioLogado) return;
  try {
    const resposta = await fetch(`${API_URL}/usuario/${usuarioLogado.id}`);
    if (!resposta.ok) throw new Error('Erro ao buscar dados do servidor');
    transacoes = await resposta.json();
    renderizarTransacoes();
  } catch (erro) {
    console.error('Erro na API', erro);
  }
}

function obterTransacoesFiltradas() {
  const mesSelecionado = filtroMesInput.value;
  if (!mesSelecionado) return transacoes;

  return transacoes.filter((t) => t.data && t.data.startsWith(mesSelecionado));
}

function atualizarResumo(filtradas) {
  const entradas = filtradas
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saidas = filtradas
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = entradas - saidas;

  totalEntradasEl.textContent = formatarMoeda(entradas);
  totalSaidasEl.textContent = formatarMoeda(saidas);
  saldoTotalEl.textContent = formatarMoeda(saldo);
}

function renderizargrafico(filtradas) {
  const canvas = document.getElementById('grafico-categorias');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Filtra apenas saídas para o gráfico de categorias
  const saidas = filtradas.filter((t) => t.tipo === 'saida');

  const categoriasValores = {};
  saidas.forEach((t) => {
    const cat = t.categoria || 'Outros';
    categoriasValores[cat] = (categoriasValores[cat] || 0) + Number(t.valor);
  });

  const labels = Object.keys(categoriasValores);
  const data = Object.values(categoriasValores);

  if (meuGrafico) {
    meuGrafico.destroy();
  }

  // Caso não haja saídas registradas no mês
  if (data.length === 0) return;

  const isDarkMode = document.body.classList.contains('dark-mode');

  meuGrafico = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#ff9F40',
            '#C9CBCF',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: isDarkMode ? '#ffffff' : '#333333' },
        },
      },
    },
  });
}

function renderizarTransacoes() {
  const filtradas = obterTransacoesFiltradas();
  listaTransacoes.innerHTML = '';

  filtradas.forEach((transacao) => {
    const li = document.createElement('li');
    li.classList.add(transacao.tipo);

    const sinal = transacao.tipo === 'entrada' ? '+' : '-';

    li.innerHTML = `
            <div class="item-info">
                <strong>${transacao.descricao}</strong>
                <span class="item-categoria">${transacao.categoria} | ${transacao.data}</span>
            </div>
            <div>
                <span>${sinal} ${formatarMoeda(Number(transacao.valor))}</span>
                <button class="btn-deletar" data-id="${transacao.id}">X</button>
            </div>
        `;

    listaTransacoes.appendChild(li);
  });

  atualizarResumo(filtradas);
  renderizargrafico(filtradas);
}

// 3. CREATE:Salvar nova transição atrelada ao usuário
async function adicionarTransacao(e) {
  e.preventDefault();

  const novaTransacao = {
    descricao: descricaoInput.value.trim(),
    valor: parseFloat(valorInput.value),
    data: dataInput.value,
    tipo: tipoSelect.value,
    categoria: categoriaSelect.value,
    usuario: { id: usuarioLogado.id },
  };

  if (
    !novaTransacao.descricao ||
    isNaN(novaTransacao.valor) ||
    novaTransacao.valor <= 0 ||
    !novaTransacao.data
  )
    return;

  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaTransacao),
    });

    if (resposta.ok) {
      descricaoInput.value = '';
      valorInput.value = '';
      descricaoInput.focus();
      carregarTransacoes();
    }
  } catch (erro) {
    console.error('Erro ao salvar transação:', erro);
  }
}

// 4. DELETE: Remover transação
async function removertransacao(id) {
  try {
    const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (resposta.ok) {
      carregarTransacoes(); // Recarrega os dados do banco
    }
  } catch (erro) {
    console.error('Erro ao deletar transação:', erro);
  }
}

// Event listeners
listaTransacoes.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-deletar')) {
    const id = e.target.getAttribute('data-id');
    removertransacao(id);
  }
});

filtroMesInput.addEventListener('change', renderizarTransacoes);

// Controle do Tema Escuro
function aplicarTema(dark) {
  if (dark) {
    document.body.classList.add('dark-mode');
    btnTema.textContent = '☀️ Modo Claro';
  } else {
    document.body.classList.remove('dark-mode');
    btnTema.textContent = '🌙 Modo Escuro';
  }
}

const modoEscuroSalvo = JSON.parse(localStorage.getItem('modoEscuro')) || false;
aplicarTema(modoEscuroSalvo);

btnTema.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('modoEscuro', JSON.stringify(isDark));
  btnTema.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro';
});

// Ação do Botão de Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = './login.html';
});

form.addEventListener('submit', adicionarTransacao);

// Inicialização das transações se o usuário estiver autenticado
if (usuarioLogado) {
  carregarTransacoes();
}