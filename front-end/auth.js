const API_AUTH = 'http://localhost:8080/api/usuarios';

const formAuth = document.getElementById('form-auth');
const campoNome = document.getElementById('campo-nome');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const btnSubmit = document.getElementById('btn-submit');
const tituloForm = document.getElementById('titulo-form');
const linkAlternar = document.getElementById('link-alternar');
const textoAlternar = document.getElementById('texto-alternar');
const msgErro = document.getElementById('msg-erro');

let modoCadastro = false;

linkAlternar.addEventListener('click', (e) => {
  e.preventDefault();
  modoCadastro = !modoCadastro;
  msgErro.textContent = '';

  if (modoCadastro) {
    tituloForm.textContent = 'Criar Nova Conta';
    campoNome.style.display = 'flex';
    nomeInput.required = true;
    btnSubmit.textContent = 'Cadastrar';
    textoAlternar.textContent = 'Já tem uma conta?';
    linkAlternar.textContent = 'Entrar';
  } else {
    tituloForm.textContent = 'Entrar no Sistema';
    campoNome.style.display = 'none';
    nomeInput.required = false;
    btnSubmit.textContent = 'Entrar';
    textoAlternar.textContent = 'Não tem uma conta?';
    linkAlternar.textContent = 'Cadastre-se';
  }
});

formAuth.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgErro.textContent = '';

  const endpoint = modoCadastro ? `${API_AUTH}/cadastrar` : `${API_AUTH}/login`;
  const dados = {
    email: emailInput.value,
    senha: senhaInput.value,
  };

  if (modoCadastro) {
    dados.nome = nomeInput.value;
  }

  try {
    const resposta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const mensagemErro = await resposta.text();
      throw new Error(mensagemErro || 'Erro de autenticação');
    }

    const respostaData = await resposta.json();

    // Se for cadastro, redireciona o usuário para fazer login~
    if (modoCadastro) {
      modoCadastro = false;
      tituloForm.textContent = 'Entrar no Sistema';
      campoNome.style.display = 'none';
      nomeInput.required = false;
      btnSubmit.textContent = 'Entrar';
      textoAlternar.textContent = 'Não tem uma conta?';
      linkAlternar.textContent = 'Cadastre-se';
      msgErro.style.color = '#10b981';
      msgErro.textContent = 'Cadastro realizado com sucesso! Faça login.';
      return;
    }

    // Processamento do Login (Suporta múltiplos formatos de resposta da API)
    const token = respostaData.token || respostaData.jwt || respostaData;
    const usuario = respostaData.usuario || respostaData.user || {
      id: respostaData.id,
      nome: respostaData.nome,
      email: respostaData.email
    };

    let tokenString = typeof respostaData === 'string' ? respostaData : (respostaData.token || respostaData.jwt);

    localStorage.setItem('token', tokenString);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    window.location.href = './index.html';
  } catch (erro) {
    msgErro.style.color = '#ef4444';
    msgErro.textContent = erro.message;
  }
});
