// ======================================================
// 1. AUTENTICAÇÃO E SEGURANÇA
// ======================================================

const usuarioLogado = JSON.parse(
  localStorage.getItem('usuarioLogado')
);

const token = localStorage.getItem('token');

if (!usuarioLogado || !token) {
  localStorage.removeItem('usuarioLogado');
  localStorage,removeItem('token');

  window.location.href = './login.html';
}

const API_URL = 'http://localhost:8080/api/transacoes';

// ======================================================
// 2. REQUISIÇÕES AUTENTICADAS
// ======================================================

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

  const resposta = await fetch(url, {
    ...options,
    headers
  });

  if (
    resposta.status === 401 ||
    resposta.status === 403
  ) {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');

    window.location.href = './login.html';

    return;
  }

  return resposta;
}

// ======================================================
// 3. ELEMENTOS DO HTML
// ======================================================

const form = document.getElementById('form-transacao');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const dataInput = document.getElementById('data');
const tipoSelect = document.getElementById('tipo');
const categoriaSelect = document.getElementById('categoria');
const contaSelect = document.getElementById('conta');
// Filtros
const filtroMesInput = document.getElementById('filtro-mes');
const filtroBuscaInput = document.getElementById('filtro-busca');
const filtroCategoriaSelect = document.getElementById('filtro-categoria');
const filtroContaSelect = document.getElementById('filtro-conta');
// Histórico
const listaTransacoes = document.getElementById('lista-transacoes');
const loadingEl = document.getElementById('loading');
// Resumo financeiro
const totalEntradasEl = document.getElementById('total-entradas');
const totalSaidasEl = document.getElementById('total-saidas');
const saldoTotalEl = document.getElementById('saldo-total');
// Botão sair
const btnLogout = document.getElementById('btn-logout');
// Modal de exclusão
const modalConfirm = document.getElementById('modal-confirm');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnConfirmarModal = document.getElementById('btn-confirmar-modal');
let idParaDeletar = null;
// Modal de edição
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
// Exportação
const btnExportCsv = document.getElementById('btn-export-csv');
const btnExportPdf = document.getElementById('btn-export-pdf');
// Variáveis globais
let meuGrafico = null;
let transacoes = [];

// ======================================================
// 4. DATA ATUAL
// ======================================================

const hoje = new Date();

const anoAtual = hoje.getFullYear();

const mesAtual = String(
  hoje.getMonth() + 1
).padStart(2, '0');

// Define a data atual no formulário

dataInput.value = [
  anoAtual,
  mesAtual,
  String(hoje.getDate()).padStart(2, '0')
].join('-');

// Define o mês atual no filtro

filtroMesInput.value =
 `${anoAtual}-${mesAtual}`;

// ======================================================
// 5. SIDEBAR RESPONSIVA
// ======================================================

const sidebar = document.getElementById('sidebar');
const menuToogle = document.getElementById('menu-toogle');
const mobileOverlay = document.getElementById('mobile-overlay');
const dataAtualEl = document.getElementById('data-atual');

// Mostra a data atual no cabeçalho

if (dataAtualEl) {
  dataAtualEl.textContent =
    hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
}

// fecha o menu mobile

function fecharMenuMobile() {
  sidebar?.classList.remove('open');
  mobileOverlay?.classList.remove('show');
}

// Abre ou fecha a sidebar

menuToogle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
  mobileOverlay?.classList.toogle('show');
});

// Fecha ao clicar fora

mobileOverlay?.addEventListener('click', fecharMenuMobile);

// Fecha ao selecionar uma opção

document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', fecharMenuMobile);
});

// ======================================================
// 6. SISTEMA DE NOTIFICAÇÕES
// ======================================================

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

// ======================================================
// 7. MÁSCARA DE MOEDA
// ======================================================

function aplicarMascaraMoeda(input) {
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (!value) {
      e.target.value = '';
      return;
    }

    value = (parseFloat(value) / 100).toFixed(2);
    e.target.value = 'R$' + value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

  })

}

aplicarMascaraMoeda(valorInput);
aplicarMascaraMoeda(editValorInput);

// ======================================================
// 8. CONVERSÃO DE VALORES
// ======================================================

function converterValorParaNumero(str) {
  if (!str) return 0;

  return parseFloat(
    str
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  );
}

// Formatação brasileira

function formatarMoeda(valor) {
  
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

}

// ======================================================
// 9. CARREGAR TRANSAÇÕES DA API
// ======================================================

async function carregarTransacoes() {
  
  if (!usuarioLogado) return;

  loadingEl.style.display = 'flex';

  try {
    const resposta = await fetchAutenticado(API_URL);

    if (!resposta || !resposta.ok) {
      throw new Error('Erro ao buscar dados do servidor');
    }
    
    transacoes = await resposta.json();
    renderizarTransacoes();

  } catch (erro) {
    console.error(erro);

    mostrarToast('Falha ao carregar transações', 'erro');

  } finally {
    loadingEl.style.display = 'none';
  }

}

// ======================================================
// 10. FILTRAR TRANSAÇÕES
// ======================================================

function obterTransacoesFiltradas() {
  const mesSelecionado = filtroMesInput ? filtroMesInput.value : '';
  const termoBusca = filtroBuscaInput ? filtroBuscaInput.value.toLowerCase().trim() : '';
  const categoriaSelecionada = filtroCategoriaSelect ? filtroCategoriaSelect.value : '';
  const contaSelecionada = filtroContaSelect ? filtroContaSelect.value : '';

  return transacoes.filter((t) => {
    const atendeMes = !mesSelecionado || (t.data && String(t.data).startsWith(mesSelecionado));
    const atendeBusca = !termoBusca || String(t.descricao || '').toLowerCase().includes(termoBusca);
    const atendeCategoria = !categoriaSelecionada || t.categoria === categoriaSelecionada;
    const atendeConta = !contaSelecionada || t.conta === contaSelecionada;

    return (atendeMes && atendeBusca && atendeCategoria && atendeConta);

  });

}

// ======================================================
// 11. ATUALIZAR RESUMO FINANCEIRO
// ======================================================

function atualizarResumo(filtradas) {
  const entradas = filtradas.filter((t) => t.tipo === 'entrada').reduce((acc,t) => acc + Number(t.valor), 0);
  const saidas = filtradas.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
  const saldo = entradas - saidas;

  totalEntradasEl.textContent = formatarMoeda(entradas);
  totalSaidasEl.textContent = formatarMoeda(saidas);
  saldoTotalEl.textContent = formatarMoeda(saldo);

}

// ======================================================
// 12. GRÁFICO DE GASTOS
// ======================================================

function renderizarGrafico(filtradas) {
  const canvas = document.getElementById('grafico-categorias');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Somente despesas

  const saidas = filtradas.filter((t) => t.tipo === 'saida');

  // Agrupar valores por categoria

  const categoriasValores = {};

  saidas.forEach((t) => {
    const cat = t.categoria || 'Outros';

    categoriasValores[cat] = (categoriasValores[cat] || 0) + Number(t.valor);

  });

  const labels = Object.keys(categoriasValores);
  const data = Object.values(categoriasValores);

  // Destruir gráfico anterior

  if (meuGrafico) {
    meuGrafico.destroy();
  }

  // Verificar estado vazio

  const vazioEl = document.getElementById('grafico-vazio');

  canvas.style.display = data.length ? 'block' : 'none';

  if (vazioEl) {
    vazioEl.hidden = data.length > 0;
  }

  if (data.length === 0) return;

  // Criar gráfico

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
            '#64748b'
          ],
          borderWidth: 2,
          borderColor: '#0f172a'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: {
              family: 'Inter'
            },
            padding: 18
          }
        },
        tootip: {
          callbacks: {
            label: function(context) {
              return (context.label + ': ' + formatarMoeda(context.raw));
            }
          }
        }
      }
    }
  });

}

// ======================================================
// 13. RENDERIZAR HISTÓRICO
// ======================================================

function renderizarTransacoes() {
  const filtradas = obterTransacoesFiltradas();

  listaTransacoes.innerHTML = '';

  // Estado vazio

  if(filtradas.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'empty-state';

    const titulo = document.createElement('strong');
    titulo.textContent = transacoes.length ? 'Nenhuma transação encontrada' : 'Adicione sua primeira movimentação usando o formulário acima.';

    vazio.append(titulo);

    listaTransacoes.appendChild(vazio);

  } else {
    filtradas.forEach((transacao) => {
      const li = document.createElement('li');

      li.classList.add(transacao.tipo === 'entrada' ? 'entrada' : 'saida');

      // Informações

      const info = document.createElement('div');
      info.className = 'item-info';

      const descricao = document.createElement('strong');
      descricao.textContent = transacao.descricao || 'Transação sem descrição';

      const detalhe = document.createElement('span');
      detalhe.className = 'item-categoria';

      const dataFormatada = transacao.data ? new Date(`${transacao.data}T00:00:00`).toLocaleDateString('pt-BR') : '';
      detalhe.textContent = `${transacao.categoria || 'Outros'} • ${transacao.conta || 'Carteira'} • ${dataFormatada}`;

      info.append(descricao, detalhe);

      // Ações e valor

      const actions = document.createElement('div');
      actions.className = 'transaction-actions';

      const amount = document.createElement('span');
      amount.className = `transaction-amount ${transacao.tipo === 'entrada' ? 'entrada' : 'saida'}`;

      amount.textContent = `${transacao.tipo === 'entrada' ? '+' : '-'} ${formatarMoeda(Number(transacao.valor))}`;

      // Botão editar

      const editar = document.createElement('button');
      editar.type = 'button';
      editar.className = 'btn-editar';
      editar.dataset.id = transacao.id;
      editar.title = 'Editar transação';
      editar.setAttribute('aria-label', `Editar ${transacao.descricao}`);
      editar.textContent = '✎';

      // Botão excluir

      const excluir = document.createElement('button');
      excluir.type = 'button';
      excluir.className = 'btn-deletar';
      excluir.dataset.id = transacao.id;
      excluir.title = 'Excluir transação';
      excluir.setAttribute('aria-label', `Excluir ${transacao.descricao}`);
      excluir.textContent = '×';

      actions.append(amount, editar, excluir);

      li.append(info, actions);
      listaTransacoes.appendChild(li);
    });

  }

  atualizarResumo(filtradas);
  renderizarGrafico(filtradas);

}

// ======================================================
// 14. ADICIONAR TRANSAÇÃO
// ======================================================

async function adicionarTransacao(e) {
  e.preventDefault();

  const valorNum = converterValorParaNumero(valorInput.value);

  const novaTransacao = {
    descricao: descricaoInput.value.trim(),
    valor: valorNum,
    data: dataInput.value,
    tipo: tipoSelect.value,
    categoria: categoriaSelect.value,
    conta: contaSelect.value
  };

  // VALIDAR CAMPOS OBRIGATÓRIOS

  if (
    !novaTransacao.descricao ||
    !Number.isFinite(novaTransacao.valor) ||
    novaTransacao.valor <= 0 ||
    !novaTransacao.data ||
    !novaTransacao.tipo ||
    !novaTransacao.categoria ||
    !novaTransacao.conta
  ) {
    mostrarToast('Preencha todos os campos obrigatórios.', 'erro');
    return;
  }

  try {
    const resposta = await fetchAutenticado(API_URL, {
      method: 'POST',
      body: JSON.stringify(novaTransacao)
    });

    if (resposta && resposta.ok) {
      // Limpar formulário
      descricaoInput.value = '';
      valorInput.value = '';

      // Voltar os selects para a opção vazia

      tipoSelect.selectedIndex = 0;
      categoriaSelect.selectedIndex = 0;
      contaSelect.selectedIndex = 0;

      dataInput.value = hoje.toISOString().split('T')[0];
      descricaoInput.focus();

      await carregarTransacoes();

      mostrarToast('Transação cadastrada com sucesso!');
    
    } else {
      throw new Error('Falha ao cadastrar transação');

    }
  } catch (erro) {
    console.error(erro);

    mostrarToast('Erro ao salvar transação', 'erro');
  }

}

// ======================================================
// 15. EDITAR E EXCLUIR TRANSAÇÕES
// ======================================================

listaTransacoes.addEventListener('click', (e) => {
  const botao = e.target.closest('button[data-id]');

  if (!botao) return;

  const id = botao.dataset.id;

  // EXCLUIR

  if (botao.classList.contains('btn-deletar')) {
    idParaDeletar = id;
    modalConfirm.classList.add('active');
  }

  // EDITAR

  else if (botao.classList.contains('btn-editar')) {
    const item = transacoes.find((t) => String(t.id) === String(id));

    if (item) {
      editIdInput.value = item.id;
      editDescricaoInput.value = item.descricao;
      editValorInput.value = formatarMoeda(Number(item.valor));
      editDataInput.value = item.data;
      editTipoSelect.value = item.tipo;
      editCategoriaSelect.value = item.categoria;

      if (editContaSelect) {
        editContaSelect.value = item.conta || 'Carteira';
      }

      modalEdit.classList.add('active');
    }

  }

});

// ======================================================
// 16. CANCELAR EXECUÇÃO
// ======================================================

btnCancelarModal.addEventListener('click', () => {
  idParaDeletar = null;

  modalConfirm.classList.remove('active');
});

// ======================================================
// 17. CONFIRMAR EXCLUSÃO
// ======================================================

btnConfirmarModal.addEventListener('click', async () => {
  if (!idParaDeletar) return;

  try {
    const resposta = await fetchAutenticado(`${API_URL}/${idParaDeletar}`,
      {
        method: 'DELETE'
      }
    );

    if (resposta && resposta.ok) {
      mostrarToast('Transação removida!');

      await carregarTransacoes();
    } else {
      throw new Error('Falha ao excluir transação');
    }

  } catch (erro) {
    console.error(erro);

    mostrarToast('Erro ao deletar item', 'erro');

  } finally {
    idParaDeletar = null;
    modalConfirm.classList.remove('active');

  }

});

// ======================================================
// 18. CANCELAR EDIÇÃO
// ======================================================

btnCancelarEdit.addEventListener('click', () => {
  modalEdit.classList.remove('active');
});

// ======================================================
// 19. SALVAR EDIÇÃO
// ======================================================

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
    usuarioId: usuarioLogado.id
  };

  if (
    !transacaoAtualizada.descricao ||
    !Number.isFinite(valorNum) ||
    valorNum <= 0 ||
    !transacaoAtualizada.data
  ) {
    mostrarToast('Preencha os campos corretamente', 'erro');
    return;
  }

  try {
    const resposta = await fetchAutenticado(`${API_URL}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(transacaoAtualizada)
      }
    );

    if (resposta && resposta.ok) {
      modalEdit.classList.remove('active');

      mostrarToast('Transação atualizada!');

      await carregarTransacoes();

    } else {
      throw new Error('Falha ao atualizar');
    }

  } catch (erro) {
    console.error(erro);

    mostrarToast('Erro ao atualizar transação', 'erro');
  }

});

// ======================================================
// 20. EXPORTAR CSV
// ======================================================

btnExportCsv.addEventListener('click', () => {
  const filtradas = obterTransacoesFiltradas();

  if (!filtradas || filtradas.length === 0) {
    mostrarToast('Nenhuma transação para exportar.', 'erro');

    return;
  }

  // Cabeçalho

  let csvContent = 'Descrição;Valor (R$);Tipo;Data:Categoria;Conta\n';

  // Dados filtrados

  filtradas.forEach((t) => {
    const descricao = `"${String(t.descricao || '').replace(/"/g,'""')}"`;

    const valor = Number(t.valor).toFixed(2).replace('.', ',');

    const tipo = t.tipo === 'entrada' ? 'Entrada' : 'Saída';
    
    const data = t.data;

    const categoria = `"${t.categoria || 'Geral'}"`;

    const conta = `"${t.conta || 'Carteira'}"`;

    csvContent += `${descricao};${valor};${tipo};${data};${categoria};${conta}\n`;

  });

  // Criar arquivo

  const blob = new Blob(
    ['\uFEFF' + csvContent],
    {
      type: 'text/csv;charset=utf-8;'
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_${filtroMesInput.value}.csv`);

  document.body.appendChild(link);

  link.click();

  setTimeout(() => {
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }, 500);

  mostrarToast('Relatório CSV baixado com sucesso!');

});

// ======================================================
// 21. EXPORTAR PDF
// ======================================================

btnExportPdf.addEventListener('click', () => {
  if (typeof html12pdf === 'undefined') {
    mostrarToast('Biblioteca de PDF ainda carregando. Tente novamente em instantes.', 'erro');

    return;
  }

  const element = document.getElementById('conteudo-relatorio');

  document.body.classList.add('imprimindo-pdf');

  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename: `relatorio_${filtroMesInput.value}.pdf`,
    image: {
      type: 'jpeg',
      quality: 0.98
    },
    html12canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy']
    }

  };

  mostrarToast('Gerando relatório PDF...');

  html12pdf()
  .set(opt)
  .from(element)
  .save()
  .then(() => {
    document.body.classList.remove('imprimindo-pdf');
  })
  .catch((erro) => {
    console.error(erro);

    document.body.classList.remove('imprimindo-pdf');

    mostrarToast('Erro ao gerar PDF', 'erro');
  });

});

// ======================================================
// 22. EVENTOS DOS FILTROS
// ======================================================

if (filtroMesInput) {
  filtroMesInput.addEventListener('change', renderizarTransacoes);
}

if (filtroBuscaInput) {
  filtroBuscaInput.addEventListener('input', renderizarTransacoes);
}

if (filtroCategoriaSelect) {
  filtroCategoriaSelect.addEventListener('change', renderizarTransacoes);
}

if (filtroContaSelect) {
  filtroContaSelect.addEventListener('change', renderizarTransacoes);
}

// ======================================================
// 23. SAIR DA CONTA
// ======================================================

btnLogout.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');
  window.location.href = './login.html';
});

// ======================================================
// 24. INICIALIZAÇÃO
// ======================================================

form.addEventListener('submit', adicionarTransacao);

if (usuarioLogado && token) {
  carregarTransacoes();
}