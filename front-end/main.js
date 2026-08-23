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
const loadingEl = document.getElementById('loading');

const totalEntradasEl = document.getElementById('total-entradas');
const totalSaidasEl = document.getElementById('total-saidas');
const saldoTotalEl = document.getElementById('saldo-total');
const btnLogout = document.getElementById('btn-logout');

// Elementos do Modal
const modalConfirm = document.getElementById('modal-confirm');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnConfirmarModal = document.getElementById('btn-confirmar-modal');
let idParaDeletar = null;

let meuGrafico = null;
let transacoes = [];

// Define data atual por padrão
const hoje = new Date();
dataInput.value = hoje.toISOString().split('T')[0];
filtroMesInput.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

// Toast Helper
function mostrarToast(mensagem, tipo = 'sucesso') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Máscara de Moeda no Input
valorInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (!value) {
    e.target.value = '';
    return;
  }
  value = (parseFloat(value) / 100).toFixed(2);
  e.target.value = 'R$ ' + value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
});

function converterValorParaNumero(str) {
  if (!str) return 0;
  return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
}

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
      mostrarToast('Falha ao carregar transações', 'erro');
  } finally {
    loadingEl.style.display = 'none';
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

  meuGrafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#ef4444',
            '#3b82f6',
            '#8b5cf6',
            '#10b981',
            '#f59e0b',
            '#ec4899',
            '#64748b',
          ],
          borderWidth: 2,
          borderColor: '#0f172a'
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { family: 'Inter' } },
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
                <span class="item-categoria">${transacao.categoria} • ${transacao.data}</span>
            </div>
            <div>
                <span style="font-weight: 600; color: ${transacao.tipo === 'entrada' ? '#10b981' : '#ef4444'}">
                  ${sinal} ${formatarMoeda(Number(transacao.valor))}
                </span>
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

  const valorNum = converterValorParaNumero(valorInput.value);

  const novaTransacao = {
    descricao: descricaoInput.value.trim(),
    valor: valorNum,
    data: dataInput.value,
    tipo: tipoSelect.value,
    categoria: categoriaSelect.value,
    usuario: { id: usuarioLogado.id },
  };

  if (!novaTransacao.descricao || isNaN(novaTransacao.valor) || novaTransacao.valor <= 0 || !novaTransacao.data) {
    mostrarToast('Preencha os campos corretamente', 'erro');
    return;
  }

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
      mostrarToast('Transação cadastrada com sucesso!');
    }
  } catch (erro) {
    mostrarToast('Erro ao salvar transação', 'erro');
  }
}

// Modal lógica
listaTransacoes.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-deletar')) {
    idParaDeletar = e.target.getAttribute('data-id');
    modalConfirm.classList.add('active');
  }
});

btnCancelarModal.addEventListener('click', () => {
  idParaDeletar = null;
  modalConfirm.classList.remove('active');
});

btnConfirmarModal.addEventListener('click', async () => {
  if (!idParaDeletar) return;
  try {
    const resposta = await fetch(`${API_URL}/${idParaDeletar}`, {method: 'DELETE'});
    if (resposta.ok) {
      mostrarToast('Transação removida!');
      carregarTransacoes();
    }
  } catch (erro) {
    mostrarToast('Erro ao deletar item', 'erro');
  } finally {
    idParaDeletar = null;
    modalConfirm.classList.remove('active');
  }
});

filtroMesInput.addEventListener('change', renderizarTransacoes);


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