// ======================================================
// CONTROLE FINANCEIRO — MAIN.JS
// Versão revisada
// Mantém API REST, JWT e autenticação existentes
// ======================================================

// ======================================================
// 1. AUTENTICAÇÃO
// ======================================================

const API_BASE = 'https://financias-production-982f.up.railway.app';

const API_URL = `${API_BASE}/api/transacoes`;

function obterUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('usuarioLogado'));
  } catch {
    return null;
  }
}

let usuarioLogado = obterUsuarioLogado();
let token = localStorage.getItem('token');

if (!usuarioLogado || !token) {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');

  window.location.href = './login.html';
}

// ======================================================
// 2. REQUISIÇÕES AUTENTICADAS
// ======================================================

async function fetchAutenticado(url, options = {}) {

  const tokenAtual = localStorage.getItem('token');

  if (!tokenAtual) {
    encerrarSessao();
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${tokenAtual}`,
    ...options.headers
  };

  // Só adiciona Content-Type quando existe corpo JSON.
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  let resposta;

  try {
    resposta = await fetch(url, {
      ...options,
      headers
    });
  } catch (erro) {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se a API está funcionando.'
    );
  }

  if (
    resposta.status === 401 ||
    resposta.status === 403
  ) {
    encerrarSessao();
    return null;
  }

  return resposta;
}


function encerrarSessao() {

  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');

  window.location.href = './login.html';

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
// Logout
const btnLogout = document.getElementById('btn-logout');
// Menu
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toogle');
const mobileOverlay = document.getElementById('mobile-overlay');
const dataAtualEl = document.getElementById('data-atual');
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
let paginaAtual = 1;
const itensPorPagina = 8;
let orcamentos = [];
let metasFinanceiras = [];

// ======================================================
// 4. DATAS
// ======================================================

// Evita problemas de fuso horário com toISOString().

function obterDataLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function obterMesLocal() {
  return obterDataLocal().slice(0, 7);
}

function formatarData(data) {
  if (!data) return '';

  const [ano, mes, dia] = String(data).split('-');

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

// Define os valores iniciais.

if (dataInput) {
  dataInput.value = obterDataLocal();
}

if (filtroMesInput) {
  filtroMesInput.value = obterMesLocal();
}

if (dataAtualEl) {
  dataAtualEl.textContent =
    new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
}

// ======================================================
// 5. MENU RESPONSIVO
// ======================================================

function abrirMenuMobile() {
  sidebar?.classList.add('open');
  mobileOverlay?.classList.add('show');
  menuToggle?.setAttribute('aria-expanded', 'true');
}

function fecharMenuMobile() {
  sidebar?.classList.remove('open');
  mobileOverlay?.classList.remove('show');
  menuToggle?.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', () => {
  const menuAberto = sidebar?.classList.contains('open');

  if (menuAberto) {
    fecharMenuMobile();
  } else {
    abrirMenuMobile();
  }
});

mobileOverlay?.addEventListener('click', fecharMenuMobile);

document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', () => {
      fecharMenuMobile();

      document.querySelectorAll('.side-nav a').forEach(item => {
          item.classList.remove('active');
      });

      link.classList.add('active');
    });
 });

// ======================================================
// 6. NOTIFICAÇÕES
// ======================================================

function mostrarToast(mensagem, tipo = 'sucesso') {
  const container = document.getElementById('toast-container');

  if (!container) {
    alert(mensagem);
    return;
  }

  const toast = document.createElement('div');

  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  toast.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// ======================================================
// 7. BOTÕES COM ESTADO DE CARREGAMENTO
// ======================================================

function definirEstadoBotao(botao, carregando, textoCarregando = 'Processando...') {
  if (!botao) return;

  if (carregando) {
    if (!botao.dataset.textoOriginal) {
      botao.dataset.textoOriginal = botao.innerHTML;
    }

    botao.disabled = true;
    botao.classList.add('is-loading');
    botao.textContent = textoCarregando;

  } else {
    botao.disabled = false;
    botao.classList.remove('is-loading');

    if (botao.dataset.textoOriginal) {
      botao.innerHTML = botao.dataset.textoOriginal;
      delete botao.dataset.textoOriginal;
    }
  }
}

// ======================================================
// 8. MOEDA
// ======================================================

function aplicarMascaraMoeda(input) {
  if (!input) return;

  input.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');

    if (!valor) {
      e.target.value = '';
      return;
    }

    valor = (parseInt(valor, 10) / 100).toFixed(2);

    e.target.value =
      'R$ ' + 
      valor
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  });
}

aplicarMascaraMoeda(valorInput);
aplicarMascaraMoeda(editValorInput);

// Converte moeda brasileira para número.

function converterValorParaNumero(valor) {
  if (typeof valor === 'number') {
    return valor;
  }

  if (!valor) {
    return 0;
  }

  const valorLimpo = String(valor)
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  return Number(valorLimpo);
}

// Formata valores para exibição.

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// ======================================================
// 9. CARREGAR TRANSAÇÕES
// ======================================================

async function carregarTransacoes() {
  if (!usuarioLogado) return;

  if (loadingEl) {
    loadingEl.style.display = 'flex';
  }

  try {
    const resposta = await fetchAutenticado(API_URL);

    if (!resposta) return;

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível carregar as transações.'
      );
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error(
        'A API retornou um formato inesperado.'
      );
    }

    transacoes = dados;
    renderizarTransacoes();
  } catch (erro) {
    console.error(erro);
    mostrarToast(erro.message || 'Falha ao carregar transações.', 'erro');
  } finally {
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }
}

// ======================================================
// 10. FILTROS
// ======================================================

function obterTransacoesFiltradas() {
  const mesSelecionado = filtroMesInput?.value || '';
  const termoBusca = filtroBuscaInput?.value.toLowerCase().trim() || '';
  const categoriaSelecionada = filtroCategoriaSelect?.value || '';
  const contaSelecionada = filtroContaSelect?.value || '';

  return transacoes.filter((transacao) => {
    const atendeMes = !mesSelecionado || String(transacao.data || '').startsWith(mesSelecionado);
    const atendeBusca = !termoBusca || String(transacao.descricao || '').toLowerCase().includes(termoBusca);
    const atendeCategoria = !categoriaSelecionada || transacao.categoria === categoriaSelecionada;
    const atendeConta = !contaSelecionada || transacao.conta === contaSelecionada;

    return (atendeMes && atendeBusca && atendeCategoria && atendeConta);
  });
}

// ======================================================
// 11. RESUMO FINANCEIRO
// ======================================================

function atualizarResumo(filtradas) {
  const entradas = filtradas.filter(t => t.tipo === 'entrada').reduce((total, t) => total + Number(t.valor || 0), 0);
  const saidas = filtradas.filter(t => t.tipo === 'saida').reduce((total, t) => total + Number(t.valor || 0), 0);
  const saldo = entradas - saidas;

  if (totalEntradasEl) {
    totalEntradasEl.textContent = formatarMoeda(entradas);
  }

  if (totalSaidasEl) {
    totalSaidasEl.textContent = formatarMoeda(saidas);
  }

  if (saldoTotalEl) {
    saldoTotalEl.textContent = formatarMoeda(saldo);
  }
}

// ======================================================
// 12. GRÁFICO DE CATEGORIAS
// ======================================================

function renderizarGrafico(filtradas) {
  const canvas = document.getElementById('grafico-categorias');
  const vazioEl = document.getElementById('grafico-vazio');

  if (!canvas) return;

  const saidas = filtradas.filter(t => t.tipo === 'saida');
  const categoriasValores = {};

  saidas.forEach((transacao) => {
    const categoria = transacao.categoria || 'Outros';
    categoriasValores[categoria] =(categoriasValores[categoria] || 0) + Number(transacao.valor || 0);
  });

  const labels = Object.keys(categoriasValores);
  const valores = Object.values(categoriasValores);

  if (meuGrafico) {
    meuGrafico.destroy();
    meuGrafico = null;
  }

  canvas.style.display = valores.length > 0 ? 'block' : 'none';

  if (vazioEl) {
    vazioEl.hidden = valores.length > 0;
    vazioEl.textContent = valores.length > 0 ? '' : 'Nenhuma despesa registrada neste período.';
  }

  if (valores.length === 0) {
    return;
  }

  if (typeof Chart === 'undefined') {
    console.error('Chart.js não foi carregado.');
    return;
  }

  meuGrafico = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: valores,
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
            borderColor: '#0f172a',
            hoverOffset: 7
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
              padding: 18,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((soma, valor) => soma + Number(valor), 0);
                const percentual = total > 0 ? (context.raw / total * 100).toFixed(1) : 0;
                
                return (`${context.label}: ` + `${formatarMoeda(context.raw)} ` + `(${percentual}%)`);
              }
            }
          }
        }
      }
    }
  );
}

// ======================================================
// 13. HISTÓRICO
// ======================================================

function renderizarTransacoes() {
  if (!listaTransacoes) return;

  const filtradas = obterTransacoesFiltradas();

  listaTransacoes.innerHTML = '';

  // Estado vazio

  if (filtradas.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'empty-state';

    const titulo = document.createElement('strong');
    titulo.textContent = transacoes.length > 0 ? 'Nenhuma transação encontrada' : 'Seu histórico está vazio';

    const descricao = document.createElement('span');
    descricao.textContent = transacoes.length > 0 ? 'Tente alterar os filtros selecionados.' : 'Adicione sua primeira movimentação para começar.';

    vazio.append(titulo, descricao);
    listaTransacoes.appendChild(vazio);
  } else {
    // Ordena da mais recente para a mais antiga.
    const ordenadas = [...filtradas].sort((a, b) => {
      return String(b.data || '').localeCompare(String(a.data || ''));
    });

    const totalPaginas = Math.max(
      1, 
      Math.ceil(ordenadas.length / itensPorPagina)
    );

    paginaAtual = Math.min(
      Math.max(1, paginaAtual),
      totalPaginas
    );

    const inicioPagina = (paginaAtual - 1) * itensPorPagina;
    const transacoesPagina = ordenadas.slice(inicioPagina, inicioPagina + itensPorPagina);

    transacoesPagina.forEach((transacao) => {
      const li = document.createElement('li');

      li.classList.add(transacao.tipo === 'entrada' ? 'entrada' : 'saida');

      // Informações

      const info = document.createElement('div');
      info.className = 'item-info';

      const descricao = document.createElement('strong');
      descricao.textContent = transacao.descricao || 'Transação sem descrição';

      const detalhe = document.createElement('span');
      detalhe.className = 'item-categoria';
      detalhe.textContent = `${transacao.categoria || 'Outros'} • ` + `${transacao.conta || 'Carteira'} • ` + `${formatarData(transacao.data)}`;

      info.append(descricao, detalhe);

      // Ações

      const actions = document.createElement('div');
      actions.className = 'transaction-actions';

      const amount = document.createElement('span');
      amount.className = `transaction-amount ${transacao.tipo === 'entrada' ? 'entrada' : 'saida'}`;
      amount.textContent = `${transacao.tipo === 'entrada' ? '+' : '−'} ${formatarMoeda(transacao.valor)}`;

      // Editar

      const editar = document.createElement('button');
      editar.type = 'button';
      editar.className = 'btn-editar';
      editar.dataset.id = transacao.id;
      editar.title = 'Editar transação';
      editar.setAttribute('aria-label', `Editar ${transacao.descricao}`);
      editar.textContent = '✎';

      // Excluir

      const excluir = document.createElement('button');
      excluir.type = 'button';
      excluir.className = 'btn-deletar';
      excluir.dataset.id = transacao.id;
      excluir.title = 'Excluir transação';
      excluir.setAttribute('aria-label', `Excluir ${transacao.descricao}`);
      excluir.textContent = '×';

      actions.append(amount, editar, excluir);

      li.append(info,actions);

      listaTransacoes.appendChild(li);
    });
  }

  atualizarPaginacao(filtradas.length);
  atualizarResumo(filtradas);
  renderizarGrafico(filtradas);
  renderizarComparativoMensal();
  renderizarOrcamentos();
  renderizarMetas();
}

// ======================================================
// PAGINAÇÃO, LIMPAR FILTROS E COMPARATIVO MENSAL
// ======================================================

function atualizarPaginacao(totalItens) {
  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
  const info = document.getElementById('paginacao-info');
  const anterior = document.getElementById('btn-pagina-anterior');
  const proxima = document.getElementById('btn-proxima-pagina');

  if (info) {
    info.textContent =
      `Página ${paginaAtual} de ${totalPaginas} • ` +
      `${totalItens} transação(ões)`;
  }

  if (anterior) anterior.disabled = paginaAtual <= 1;
  if (proxima) proxima.disabled = paginaAtual >= totalPaginas;

}

document.getElementById('btn-pagina-anterior')?.addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    renderizarTransacoes();
  }
});

document.getElementById('btn-proxima-pagina')?.addEventListener('click', () => {
  const total = obterTransacoesFiltradas().length;

  if (paginaAtual < Math.ceil(total / itensPorPagina)) {
    paginaAtual++;
    renderizarTransacoes();
  }
});

document.getElementById('btn-limpar-filtros')?.addEventListener('click', () => {
  if (filtroMesInput) filtroMesInput.value = '';
  if (filtroBuscaInput) filtroBuscaInput.value = '';
  if (filtroCategoriaSelect) filtroCategoriaSelect.value = '';
  if (filtroContaSelect) filtroContaSelect.value = '';

  paginaAtual = 1;
  renderizarTransacoes();
});

function deslocarMes(mes, deslocamento) {
  const [ano, numeroMes] = (mes || obterMesLocal()).split('-').map(Number);
  const data = new Date(ano, numeroMes - 1 + deslocamento, 1);

  return (
    `${data.getFullYear()}-` +
    `${String(data.getMonth() + 1).padStart(2, '0')}`
  );

}

function nomeMes(mes) {
  const [ano, numeroMes] = mes.split('-').map(Number);

  return new Date(ano, numeroMes - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

}

function totalSaidasMes(mes) {
  return transacoes
    .filter(t => 
      t.tipo === 'saida' && 
      String(t.data || '').startsWith(mes)
    ).reduce((sum, t) => sum + Number(t.valor || 0), 0);
}

function renderizarComparativoMensal() {
  const mesAtual = filtroMesInput?.value || obterMesLocal();
  const mesAnterior = deslocarMes(mesAtual, -1);

  const atual = totalSaidasMes(mesAtual);
  const anterior = totalSaidasMes(mesAnterior);
  const diferenca = atual - anterior;

  const percent = anterior > 0 ? (diferenca / anterior) * 100 : null;

  const labelAtual = document.getElementById('comparativo-mes-atual-label');
  const labelAnterior = document.getElementById('comparativo-mes-anterior-label');
  const valorAtual = document.getElementById('comparativo-mes-atual');
  const valorAnterior = document.getElementById('comparativo-mes-anterior');
  const variacao = document.getElementById('comparativo-variacao');
  const mensagem = document.getElementById('comparativo-mensagem');

  if (labelAtual) labelAtual.textContent = nomeMes(mesAtual);
  if (labelAnterior) labelAnterior.textContent = nomeMes(mesAnterior);

  if (valorAtual) valorAtual.textContent = formatarMoeda(atual);
  if (valorAnterior) valorAnterior.textContent = formatarMoeda(anterior);

  if (variacao) {
    variacao.classList.remove('is-negative', 'is-positive');

    if (anterior == 0) {
      variacao.textContent = atual === 0 ? '0%' : '-';
    } else {
      variacao.textContent = `${diferenca > 0 ? '+' : ''}${percent.toFixed(1)}%`;
    }

    if (diferenca > 0) {
      variacao.classList.add('is-negative');
    } else if (diferenca < 0) {
      variacao.classList.add('is-positive');
    }
  }

  if (mensagem) {
    if (anterior === 0 && atual > 0) {
      mensagem.textContent = 'Sem despesas no mês anterior para comparar';
    } else if (diferenca > 0) {
      mensagem.textContent = `Você gastou ${Math.abs(percent).toFixed(1)}% a mais`;
    } else if (diferenca < 0) {
      mensagem.textContent = `Você gastou ${Math.abs(percent).toFixed(1)}% a menos`;
    } else {
      mensagem.textContent = 'Despesas iguais nos dois meses';
    }
  }

  // Atualiza os textos do gráfico
  const graficoAtualLabel = document.getElementById('grafico-mes-atual-label');
  const graficoAnteriorLabel = document.getElementById('grafico-mes-anterior-label');
  const graficoAtualValor = document.getElementById('grafico-mes-atual-valor');
  const graficoAnteriorValor = document.getElementById('grafico-mes-anterior-valor');

  if (graficoAtualLabel) graficoAtualLabel.textContent = nomeMes(mesAtual);
  if (graficoAnteriorLabel) graficoAnteriorLabel.textContent = nomeMes(mesAnterior);

  if (graficoAtualValor) graficoAtualValor.textContent = formatarMoeda(atual);
  if (graficoAnteriorValor) graficoAnteriorValor.textContent = formatarMoeda(anterior);

  // A maior despesa é a referência para as duas barras
  const maiorValor = Math.max(atual, anterior, 1);

  const barraAtual = document.getElementById('grafico-mes-atual-bar');
  const barraAnterior = document.getElementById('grafico-mes-anterior-bar');

  if (barraAtual) {
    barraAtual.style.width = `${(atual / maiorValor) * 100}%`;
  }

  if (barraAnterior) {
    barraAnterior.style.width = `${(anterior / maiorValor) * 100}%`;
  }
}

// ======================================================
// ORÇAMENTOS E METAS - API
// ======================================================

const ORCAMENTOS_URL = `${API_BASE}/api/orcamentos`;
const METAS_URL = `${API_BASE}/api/metas`;

async function carregarPlanejamento() {
  try {
    const [resOrc, resMetas] = await Promise.all([
      fetchAutenticado(ORCAMENTOS_URL),
      fetchAutenticado(METAS_URL)
    ]);

    if (resOrc?.ok) {
      orcamentos = await resOrc.json();
    }

    if (resMetas?.ok) {
      metasFinanceiras = await resMetas.json();
    }
  } catch (err) {
    console.error('Falha ao carregar planejamento: ', err);

    mostrarToast('Não foi possível carregar orçamentos e metas.', 'erro');
  }

  renderizarOrcamentos();
  renderizarMetas();
}

function renderizarOrcamentos() {
  const alvo = document.getElementById('lista-orcamentos');
  const contador = document.getElementById('orcamentos-contagem');

  if (!alvo) return;

  const mes = filtroMesInput?.value || obterMesLocal();
  const orcamentosDoMes = (orcamentos || []).filter(o => o.mes === mes);

  alvo.innerHTML = '';

  if (contador) {
    contador.textContent = 
      `${orcamentosDoMes.length} orçamento${orcamentosDoMes.length === 1 ? '' : 's'}`;
  }

  if (!orcamentosDoMes.length) {
    alvo.innerHTML = `
      <div class="finance-empty-state">
        <span class="empty-state-icon">▤</span>
        <strong>Nenhum orçamento para este mês</strong>
        <p>Escolha uma categoria e defina um limite mensal para começar.</p>
      </div>
    `;
    return;
  }

  orcamentos.forEach(o => {
    const gasto = transacoes
      .filter(t => 
        t.tipo === 'saida' && 
        t.categoria === o.categoria && 
        String(t.data || '').startsWith(mes)
      )
      .reduce((s, t) => s + Number(t.valor || 0), 0);

    const limite = Number(o.limite || 0);
    const percentual = limite > 0 ? (gasto / limite) * 100 : 0;
    const percentualVisual = Math.min(100, percentual);
    const restante = limite - gasto;

    const card = document.createElement('article');
    card.className = 'finance-tool-item';

    if (gasto > limite) {
      card.classList.add('is-over-limit');
    }

    const head = document.createElement('div');
    head.className = 'finance-tool-item-head';

    const nome = document.createElement('strong');
    nome.textContent = o.categoria;

    const valores = document.createElement('span');
    valores.textContent = `${formatarMoeda(gasto)} / ${formatarMoeda(limite)}`;

    head.append(nome, valores);

    const progress = document.createElement('progress');
    progress.max = 100;
    progress.value = percentualVisual;
    progress.setAttribute(
      'aria-label',
      `${o.categoria}: ${percentual.toFixed(0)}% do orçamento utilizado`
    );

    const footer = document.createElement('div');
    footer.className = 'finance-tool-item-footer';

    if (gasto > limite) {
      footer.textContent =
        `Limite ultrapassado em ${formatarMoeda(gasto - limite)} • ${percentual.toFixed(0)}% utilizado`;
    } else {
      footer.textContent = 
        `${percentual.toFixed(0)}% utilizado • Restam ${formatarMoeda(restante)}`;
    }

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-deletar';
    del.textContent = 'Excluir orçamento';

    del.addEventListener('click', () => {
      excluirOrcamento(o.id);
    });

    card.append(head, progress, footer, del);
    alvo.append(card);
  });

}

function renderizarMetas() {
  const alvo = document.getElementById('lista-metas');
  const contador = document.getElementById('metas-contagem');

  if (!alvo) return;
  
  alvo.innerHTML = '';

  const lista = metasFinanceiras || [];

  if (contador) {
    contador.textContent =
      `${lista.length} meta${lista.length === 1 ? '' : 's'}`;
  }

  if (!lista.length) {
    alvo.innerHTML = `
      <div class="finance-empty-state">
        <span class="empty-state-icon">◎</span>
        <strong>Nenhuma meta cadastrada</strong>
        <p>Adicione um objetivo para acompanhar quanto falta economizar.</p>
      </div>
    `;
    return;
  }

  lista.forEach(m => {
    const valorAlvo = Number(m.valorAlvo || 0);
    const valorAtual = Number(m.valorAtual || 0);

    const percentual = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;
    const percentualVisual = Math.min(100, percentual);
    const falta = Math.max(0, valorAlvo - valorAtual);
    const concluida = valorAtual >= valorAlvo;

    const card = document.createElement('article');
    card.className = 'finance-tool-item';

    if (concluida) {
      card.classList.add('is-complete');
    }

    const head = document.createElement('div');
    head.className = 'finance-tool-item-head';

    const nome = document.createElement('strong');
    nome.textContent = m.nome;

    const valores = document.createElement('span');
    valores.textContent = `${formatarMoeda(valorAtual)} / ${formatarMoeda(valorAlvo)}`;

    head.append(nome, valores);

    const progress = document.createElement('progress');
    progress.max = 100;
    progress.value = percentualVisual;
    progress.setAttribute(
      'aria-label',
      `${m.nome}: ${percentual.toFixed(0)}% concluído`
    );

    const footer = document.createElement('div');
    footer.className = 'finance-tool-item-footer';

    if (concluida) {
      footer.textContent =
        `Meta alcançada! Você economizou ${formatarMoeda(valorAtual)}.`;
    } else {
      footer.textContent =
        `${percentual.toFixed(1)}% concluído • Faltam ${formatarMoeda(falta)}` +
        `${m.prazo ? ' • Prazo: ' + formatarData(m.prazo) : ''}`;
    }

    const actions = document.createElement('div');
    actions.className = 'finance-tool-actions';

    const update = document.createElement('button');
    update.type = 'button';
    update.className = 'btn-secondary';
    update.textContent = 'Atualizar valor guardado';

    update.addEventListener('click', async () => {
      const entrada = prompt(
        `Quanto você já economizou para "${m.nome}"?`,
        String(valorAtual.toFixed(2))
      );

      if (entrada === null) return;

      const valor = Number(entrada.replace(',', '.'));

      if (!Number.isFinite(valor) || valor < 0) {
        mostrarToast('Informe um valor válido.', 'erro');
        return;
      }

      await salvarMeta({
        ...m,
        valorAtual: valor
      }, 'PUT');
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-deletar';
    del.textContent = 'Excluir meta';

    del.addEventListener('click', () => {
      excluirMeta(m.id);
    });

    actions.append(update, del);
    card.append(head, progress, footer, actions);
    alvo.append(card);
  });
}

async function salvarMeta(meta, metodo = 'POST') {
  try {
    const response = await fetchAutenticado(
      metodo === 'POST' ? METAS_URL : `${METAS_URL}/${meta.id}`,
      {
        method: metodo,
        body: JSON.stringify(meta)
      }
    );

    if (!response) {
      throw new Error('A sessão expirou. Faça login novamente.');
    }

    if (!response?.ok) {
      const respostaTexto = await response.text();

      console.error('Erro ao salvar meta:', {
        status: response.status,
        resposta: respostaTexto
      });

      throw new Error(
        `Erro ${response.status}: ${respostaTexto || 'Não foi possível salvar a meta.'}`
      );
    }

    await carregarPlanejamento();
    mostrarToast('Meta salva!');

  } catch (e) {
    console.error(e);
    mostrarToast(e.message, 'erro');
  }
}

async function excluirMeta(id) {
  if (!confirm('Excluir esta meta financeira?')) return;

  try {
    const r = await fetchAutenticado(
      `${METAS_URL}/${id}`,
      { method: 'DELETE' }
    );

    if (!r?.ok) {
      throw new Error('Falha ao excluir meta.');
    }

    await carregarPlanejamento();
    mostrarToast('Meta excluída.');

  } catch (e) {
    mostrarToast(e.message, 'erro');
  }
}

async function excluirOrcamento(id) {
  if (!confirm('Excluir este orçamento?')) return;

  try {
    const r = await fetchAutenticado(
      `${ORCAMENTOS_URL}/${id}`,
      { method: 'DELETE' }
    );

    if (!r?.ok) {
      throw new Error('Falha ao excluir orçamento.');
    }

    await carregarPlanejamento();
    mostrarToast('Orçamento excluído.');

  } catch (e) {
    mostrarToast(e.message, 'erro');
  }
}

document.getElementById('form-orcamento')?.addEventListener('submit', async e => {
  e.preventDefault();

  const categoria = document.getElementById('orcamento-categoria').value;
  const limite = Number(document.getElementById('orcamento-limite').value);

  if (
    !categoria ||
    !Number.isFinite(limite) ||
    limite <= 0
  ) {
    mostrarToast('Informe categoria e limite válido.', 'erro');
    return;
  }

  try {
    const r = await fetchAutenticado(
      ORCAMENTOS_URL,
      {
        method: 'POST',
        body: JSON.stringify({
          categoria,
          limite,
          mes: filtroMesInput?.value || obterMesLocal()
        })
      }
    );

    if (!r?.ok) {
      throw new Error('Não foi possível salvar o orçamento.');
    }

    e.target.reset();

    await carregarPlanejamento();
    mostrarToast('Orçamento salvo!');

  } catch (err) {
    mostrarToast(err.message, 'erro');
  }
});

document.getElementById('form-meta')?.addEventListener('submit', async e => {
  e.preventDefault();

  const meta = {
    nome: document.getElementById('meta-nome').value.trim(),
    valorAlvo: Number(document.getElementById('meta-alvo').value),
    valorAtual: Number(document.getElementById('meta-atual').value || 0),
    prazo: document.getElementById('meta-prazo').value || null
  };

  if (
    !meta.nome ||
    !Number.isFinite(meta.valorAlvo) ||
    meta.valorAlvo <= 0 ||
    !Number.isFinite(meta.valorAtual) ||
    meta.valorAtual < 0
  ) {
    mostrarToast('Preencha os dados da meta corretamente.', 'erro');
    return;
  }

  await salvarMeta(meta);

  e.target.reset();

  document.getElementById('meta-atual').value = '0';
});

// ======================================================
// 14. ADICIONAR TRANSAÇÃO
// ======================================================

async function adicionarTransacao(e) {
  e.preventDefault();

  const valorNum = converterValorParaNumero(valorInput.value);
  const novaTransacao = {
    descricao:descricaoInput.value.trim(),
    valor: valorNum,
    data: dataInput.value,
    tipo: tipoSelect.value,
    categoria: categoriaSelect.value,
    conta: contaSelect.value
  };

  // Validação

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

  const botao = form.querySelector('[type="submit"]');

  definirEstadoBotao(botao, true, 'Salvando...');

  try {
    const resposta = await fetchAutenticado(API_URL, {
          method: 'POST',
          body: JSON.stringify(novaTransacao)
    });

    if (!resposta) return;

    if (!resposta.ok) {
      throw new Error(
        'Não foi possível cadastrar a transação.'
      );
    }

    // Limpa o formulário.

    form.reset();

    dataInput.value = obterDataLocal();

    descricaoInput.focus();

    await carregarTransacoes();

    mostrarToast('Transação cadastrada com sucesso!');

  } catch (erro) {
    console.error(erro);
    mostrarToast(erro.message || 'Erro ao salvar transação.', 'erro');

  } finally {
    definirEstadoBotao(botao, false);
  }
}

// ======================================================
// 15. ABRIR MODAIS
// ======================================================

listaTransacoes?.addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-id]');

    if (!botao) return;

    const id = botao.dataset.id;

    // Excluir

    if (botao.classList.contains('btn-deletar')) {
      idParaDeletar = id;

      const transacao = transacoes.find(t => String(t.id) === String(id));
      const textoConfirmacao = modalConfirm.querySelector('p');

      if (textoConfirmacao && transacao) {
        textoConfirmacao.textContent = `Deseja realmente excluir "${transacao.descricao}" ` + `no valor de ${formatarMoeda(transacao.valor)}? ` + 'Esta ação não pode ser desfeita.';
      }
      modalConfirm.classList.add('active');
    }

    // Editar

    else if (botao.classList.contains('btn-editar')) {
      const item = transacoes.find(t => String(t.id) === String(id));

      if (!item) return;

      editIdInput.value = item.id;
      editDescricaoInput.value = item.descricao || '';
      editValorInput.value = formatarMoeda(Number(item.valor));
      editDataInput.value = item.data || '';
      editTipoSelect.value = item.tipo || '';
      editCategoriaSelect.value = item.categoria || '';
      editContaSelect.value = item.conta || '';

      modalEdit.classList.add('active');
      editDescricaoInput.focus();
    }
  }
);

// ======================================================
// 16. CANCELAR EXCLUSÃO
// ======================================================

btnCancelarModal?.addEventListener('click', () => {
    idParaDeletar = null;
    modalConfirm.classList.remove('active');
  }
);

// ======================================================
// 17. CONFIRMAR EXCLUSÃO
// ======================================================

btnConfirmarModal?.addEventListener('click', async () => {
    if (!idParaDeletar) return;

    definirEstadoBotao(btnConfirmarModal, true, 'Excluindo...');

    try {
      const resposta = await fetchAutenticado(`${API_URL}/${idParaDeletar}`, {method: 'DELETE'});

      if (!resposta) return;

      if (!resposta.ok) {
        throw new Error(
          'Não foi possível excluir a transação.'
        );
      }

      await carregarTransacoes();

      mostrarToast('Transação removida com sucesso!');

    } catch (erro) {
      console.error(erro);
      mostrarToast(erro.message || 'Erro ao excluir transação.', 'erro');
    } finally {
      idParaDeletar = null;
      modalConfirm.classList.remove('active');
      definirEstadoBotao(btnConfirmarModal, false);
    }
  }
);

// ======================================================
// 18. CANCELAR EDIÇÃO
// ======================================================

btnCancelarEdit?.addEventListener('click', () => {
    modalEdit.classList.remove('active');
  }
);

// ======================================================
// 19. SALVAR EDIÇÃO
// ======================================================

formEditar?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = editIdInput.value;
    const valorNum = converterValorParaNumero(editValorInput.value);
    const transacaoAtualizada = {
      id,
      descricao: editDescricaoInput.value.trim(),
      valor: valorNum,
      data: editDataInput.value,
      tipo: editTipoSelect.value,
      categoria: editCategoriaSelect.value,
      conta: editContaSelect.value,
      usuarioId: usuarioLogado.id
    };

    // Validação completa

    if (
      !transacaoAtualizada.descricao ||
      !Number.isFinite(valorNum) ||
      valorNum <= 0 ||
      !transacaoAtualizada.data ||
      !transacaoAtualizada.tipo ||
      !transacaoAtualizada.categoria ||
      !transacaoAtualizada.conta
    ) {
      mostrarToast('Preencha todos os campos corretamente.', 'erro');
      return;
    }

    const botao = formEditar.querySelector('[type="submit"]');

    definirEstadoBotao(botao, true, 'Salvando...');

    try {
      const resposta = await fetchAutenticado(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transacaoAtualizada)
      });

      if (!resposta) return;

      if (!resposta.ok) {
        throw new Error(
          'Não foi possível atualizar a transação.'
        );
      }

      modalEdit.classList.remove('active');
      await carregarTransacoes();

      mostrarToast('Transação atualizada com sucesso!');

    } catch (erro) {
      console.error(erro);
      mostrarToast(erro.message || 'Erro ao atualizar transação.', 'erro');
    } finally {
      definirEstadoBotao(botao, false);
    }
  }
);

// ======================================================
// 20. FILTROS EM TEMPO REAL
// ======================================================

filtroMesInput?.addEventListener('change', () => {
  paginaAtual = 1;
  renderizarTransacoes();
});

filtroBuscaInput?.addEventListener('input', () => {
  paginaAtual = 1;
  renderizarTransacoes();
});

filtroCategoriaSelect?.addEventListener('change', () => {
  paginaAtual = 1;
  renderizarTransacoes();
});

filtroContaSelect?.addEventListener('change', () => {
  paginaAtual = 1;
  renderizarTransacoes();
});

// ======================================================
// 21. EXPORTAR CSV
// ======================================================

btnExportCsv?.addEventListener('click', () => {
  const filtradas = obterTransacoesFiltradas();

  if (filtradas.length === 0) {
    mostrarToast('Nenhuma transação para exportar.', 'erro');
    return;
  }

  let csvContent = 'Descrição;Valor (R$);Tipo;Data;Categoria;Conta\n';

  filtradas.forEach((t) => {
    const descricao = `"${String(t.descricao || '').replace(/"/g, '""')}"`;
    const valor = Number(t.valor).toFixed(2).replace('.', ',');
    const tipo = t.tipo === 'entrada' ? 'Entrada' : 'Saída';
    const data = t.data || '';
    const categoria = `"${String(t.categoria || '').replace(/"/g, '""')}"`;
    const conta = `"${String(t.conta || '').replace(/"/g, '""')}"`;

    csvContent += `${descricao};${valor};${tipo};` + `${data};${categoria};${conta}\n`;
  });

  const blob = new Blob(['\uFEFF' + csvContent], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `controle_financeiro_${filtroMesInput.value || 'geral'}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  mostrarToast('Arquivo CSV exportado!');
});

// ======================================================
// 22. EXPORTAR PDF
// ======================================================

btnExportPdf?.addEventListener('click', async () => {
  if (typeof html2pdf === 'undefined') {
    mostrarToast('A biblioteca PDF não foi carregada.', 'erro');
      return;
    }

    const elemento = document.getElementById('conteudo-relatorio');

    if (!elemento) {
      mostrarToast('Não foi possível encontrar o relatório.','erro');
      return;
    }

    document.body.classList.add('imprimindo-pdf');

    try {
      await html2pdf().set({
          margin: 0.3,
          filename:`controle_financeiro_${filtroMesInput.value || 'geral'}.pdf`,
          image: {
            type: 'jpeg',
            quality: 0.98
          },
          html2canvas: {
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
        }).from(elemento).save();

      mostrarToast('PDF exportado com sucesso!');
    } catch (erro) {
      console.error(erro);
      mostrarToast('Erro ao gerar o PDF.', 'erro');
    } finally {
      document.body.classList.remove('imprimindo-pdf');
    }
});

// ======================================================
// 23. LOGOUT
// ======================================================

btnLogout?.addEventListener('click', encerrarSessao);

// ======================================================
// 24. FECHAR MODAIS COM ESC
// ======================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalConfirm?.classList.remove('active');
      modalEdit?.classList.remove('active');
      fecharMenuMobile();
      idParaDeletar = null;
    }
  }
);

// ======================================================
// 25. INICIALIZAÇÃO
// ======================================================

form?.addEventListener('submit', adicionarTransacao);

if (usuarioLogado && token) {
  carregarTransacoes();
  carregarPlanejamento();
}