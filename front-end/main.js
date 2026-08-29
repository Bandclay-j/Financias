// 1. Trava de Segurança: redireciona imediatamente se não houver sessão/token ativa
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
const token = localStorage.getItem('token');

if (!usuarioLogado || !token) {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');
  window.location.href = './login.html';
}

const API_URL = 'http://localhost:8080/api/transacoes';

// Helper para fazer requisitações HTTP enviando o Bearer Token do JWT
async function fetchAutenticado(url, options = {}) {
  const tokenAtual = localStorage.getItem('token');

  if (!tokenAtual) {
    window.location.href = './login.html';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenAtual}`,
    ...options.headers,
  };

  const resposta = await fetch(url, { ...options, headers });

  // Se o token expirar ou for inválido (HTTP 401 ou 403), redireciona para o login
  if (resposta.status === 401 || resposta.status === 403) {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');
    window.location.href = './login.html';
    return;
  } 

  return resposta;
}

const form = document.getElementById('form-transacao');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const dataInput = document.getElementById('data');
const tipoSelect = document.getElementById('tipo');
const categoriaSelect = document.getElementById('categoria');
const contaSelect = document.getElementById('conta');

//Elementos dos Filtros Avançados
const filtroMesInput = document.getElementById('filtro-mes');
const filtroBuscaInput = document.getElementById('filtro-busca');
const filtroCategoriaSelect = document.getElementById('filtro-categoria');
const filtroContaSelect = document.getElementById('filtro-conta');

const listaTransacoes = document.getElementById('lista-transacoes');
const loadingEl = document.getElementById('loading');
const totalEntradasEl = document.getElementById('total-entradas');
const totalSaidasEl = document.getElementById('total-saidas');
const saldoTotalEl = document.getElementById('saldo-total');
const btnLogout = document.getElementById('btn-logout');

// Elementos do Modais
const modalConfirm = document.getElementById('modal-confirm');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnConfirmarModal = document.getElementById('btn-confirmar-modal');
let idParaDeletar = null;

const modalEdit = document.getElementById('modal-edit');
const formEditar = document.getElementById('form-editar-transacao');
const editIdInput = document.getElementById('edit-id');
const editDescricaoInput = document.getElementById('edit-descricao');
const editValorInput = document.getElementById('edit-valor');
const editDataInput = document.getElementById('edit-data');
const editTipoSelect = document.getElementById('edit-tipo');
const editCategoriaSelect = document.getElementById('edit-categoria');
const editContaSelect = document.getElementById('edit-conta');
const btnCancelarEdit = document.getElementById('btn-cancelar-edit');

const btnExportCsv = document.getElementById('btn-export-csv');
const btnExportPdf = document.getElementById('btn-export-pdf');

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
function aplicarMascaraMoeda(input) {
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      e.target.value = '';
      return;
    }
    value = (parseFloat(value) / 100).toFixed(2);
    e.target.value = 'R$ ' + value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  });
}

aplicarMascaraMoeda(valorInput);
aplicarMascaraMoeda(editValorInput);

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
  loadingEl.style.display = 'flex';
  try {
    const resposta = await fetchAutenticado(API_URL);
    if (!resposta || !resposta.ok) throw new Error('Erro ao buscar dados do servidor');
    transacoes = await resposta.json();
    renderizarTransacoes();
  } catch (erro) {
      mostrarToast('Falha ao carregar transações', 'erro');
  } finally {
    loadingEl.style.display = 'none';
  }
}

function obterTransacoesFiltradas() {
  const mesSelecionado = filtroMesInput ? filtroMesInput.value : '';
  const termoBusca = filtroBuscaInput ? filtroBuscaInput.value.toLowerCase().trim() : '';
  const categoriaSelecionada = filtroCategoriaSelect ? filtroCategoriaSelect.value : '';
  const contaSelecionada = filtroContaSelect ? filtroContaSelect.value : '';

  return transacoes.filter((t) => {
    const atendeMes = !mesSelecionado || (t.data && String(t.data).startsWith(mesSelecionado));
    const atendeBusca = !termoBusca || t.descricao.toLowerCase().includes(termoBusca);
    const atendeCategoria = !categoriaSelecionada || t.categoria === categoriaSelecionada;
    const atendeConta = !contaSelecionada || t.conta === contaSelecionada;

    return atendeMes && atendeBusca && atendeCategoria && atendeConta;
  });
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
    const contaTag = transacao.conta ? ` • ${transacao.conta}` : '';

    li.innerHTML = `
            <div class="item-info">
                <strong>${transacao.descricao}</strong>
                <span class="item-categoria">${transacao.categoria}${contaTag} • ${transacao.data}</span>
            </div>
            <div>
                <span style="font-weight: 600; color: ${transacao.tipo === 'entrada' ? '#10b981' : '#ef4444'}">
                  ${sinal} ${formatarMoeda(Number(transacao.valor))}
                </span>
                <button class="btn-editar" data-id="${transacao.id}">✎</button>
                <button class="btn-deletar" data-id="${transacao.id}">✕</button>
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
    conta: contaSelect ? contaSelect.value : 'Carteira',
    usuarioId:  usuarioLogado.id,
  };

  if (!novaTransacao.descricao || isNaN(novaTransacao.valor) || novaTransacao.valor <= 0 || !novaTransacao.data) {
    mostrarToast('Preencha os campos corretamente', 'erro');
    return;
  }

  try {
    const resposta = await fetchAutenticado(API_URL, {
      method: 'POST',
      body: JSON.stringify(novaTransacao),
    });

    if (resposta && resposta.ok) {
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

// Clique nos Botões Editar / Deletar do histórico
listaTransacoes.addEventListener('click', (e) => {
  const id = e.target.getAttribute('data-id');
  if (!id) return;

  if (e.target.classList.contains('btn-deletar')) {
    idParaDeletar = id;
    modalConfirm.classList.add('active');
  } else if (e.target.classList.contains('btn-editar')) {
    const item = transacoes.find((t) => String(t.id) === String(id));
    if (item) {
      editIdInput.value = item.id;
      editDescricaoInput.value = item.descricao;
      editValorInput.value = formatarMoeda(Number(item.valor));
      editDataInput.value = item.data;
      editTipoSelect.value = item.tipo;
      editCategoriaSelect.value = item.categoria;
      if (editContaSelect) editContaSelect.value = item.conta || 'Carteira';
      modalEdit.classList.add('active');
    }
  }
});

// Modal Deletar Lógica
btnCancelarModal.addEventListener('click', () => {
  idParaDeletar = null;
  modalConfirm.classList.remove('active');
});

btnConfirmarModal.addEventListener('click', async () => {
  if (!idParaDeletar) return;
  try {
    const resposta = await fetchAutenticado(`${API_URL}/${idParaDeletar}`, { method: 'DELETE'});
    if (resposta && resposta.ok) {
      mostrarToast('Transação removida!');
      carregarTransacoes();
    }
  } catch (erro) {
    mostrarToast('Erro ao deletar item', 'erro');
  } finally {
    idParaDeletar=null;
    modalConfirm.classList.remove('active');
  }
});

// Modal Editar Lógica
btnCancelarEdit.addEventListener('click', () => {
  modalEdit.classList.remove('active');
});

formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = editIdInput.value;
  const valorNum = converterValorParaNumero(editValorInput.value);

  const transacaoAtualizada = {
    id: id,
    descricao: editDescricaoInput.value.trim(),
    valor: valorNum,
    data: editDataInput.value,
    tipo: editTipoSelect.value,
    categoria: editCategoriaSelect.value,
    conta: editContaSelect ? editContaSelect.value : 'Carteira',
    usuarioId: usuarioLogado.id,
  };

  try {
    const resposta = await fetchAutenticado(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transacaoAtualizada),
    });

    if (resposta && resposta.ok) {
      modalEdit.classList.remove('active');
      mostrarToast('Transação atualizada!');
      carregarTransacoes();
    } else {
      throw new Error('Falha ao atualizar');
    }
  } catch (erro) {
    mostrarToast('Erro ao atualizar transação', 'erro');
  }
});

// Exportar para CSV
btnExportCsv.addEventListener('click', () => {
  const filtradas = obterTransacoesFiltradas();
  if (!filtradas || filtradas.length === 0) {
    mostrarToast('Nenhuma transação para exportar.', 'erro');
    return;
  }

  // Cabeçalho do CSV
  let csvContent = 'Descrição;Valor (R$);Tipo;Data;Categoria;Conta\n';

  // Conteúdo das linhas
  transacoes.forEach((t) => {
    const descricao = `"${t.descricao.replace(/"/g, '""')}"`;
    const valor = Number(t.valor).toFixed(2).replace('.', ',');
    const tipo = t.tipo === 'entrada' ? 'Entrada' : 'Saída';
    const data = t.data;
    const categoria = `"${t.categoria || 'Geral'}"`;
    const conta = `${t.conta || 'Carteira'}`;

    csvContent += `${descricao};${valor};${tipo};${data};${categoria};${conta}\n`;
  });

  // Adiciona o BOM (\uFEFF) para garantir acentuação correta no Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_${filtroMesInput.value}.csv`);
  document.body.appendChild(link);

  // Executa o download
  link.click();

  // Aguarda o navegador processar o download antes de remover a URL do Blob
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 500);

  mostrarToast('Relatório CSV baixado com sucesso!');
});

// Exportar para PDF (Ajustado em Página Única)
btnExportPdf.addEventListener('click', () => {
  if (typeof html2pdf === 'undefined') {
    mostrarToast('Biblioteca de PDF ainda carregando. Tente novamente em instantes.', 'erro');
    return;
  }

  const element = document.getElementById('conteudo-relatorio');

  document.body.classList.add('imprimindo-pdf');

  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2], // Margens reduzidas
    filename: `relatorio_${filtroMesInput.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Evita quebrar elementos ao meio
  };

  mostrarToast('Gerando relatório PDF...');

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      document.body.classList.remove('imprimindo-pdf');
    })
    .catch(() => {
      document.body.classList.remove('imprimindo-pdf');
      mostrarToast('Erro ao gerar PDF', 'erro');
    });
});

if (filtroMesInput) filtroMesInput.addEventListener('change', renderizarTransacoes);
if (filtroBuscaInput) filtroBuscaInput.addEventListener('input', renderizarTransacoes);
if (filtroCategoriaSelect) filtroCategoriaSelect.addEventListener('change', renderizarTransacoes);
if (filtroContaSelect) filtroContaSelect.addEventListener('change', renderizarTransacoes);

btnLogout.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');
  window.location.href = './login.html';
});

form.addEventListener('submit', adicionarTransacao);

if (usuarioLogado && token) {
  carregarTransacoes();
}
