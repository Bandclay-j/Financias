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
    campoNome.style.display = 'block';
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
      throw new Error(
        modoCadastro ? 'Erro ao cadastrar usuário' : 'Email ou senha incorretos'
      );
    }

    const usuario = await resposta.json();

    // Salva o usuário logado na sessão do navegador
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    // Redireciona para a página principal da planilha
    window.location.href = './index.html';
  } catch (erro) {
    msgErro.textContent = erro.message;
  }
});
