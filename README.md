```markdown
# 💰 Gerenciador de Finanças Pessoais

Aplicação Full Stack para controle de finanças pessoais, permitindo o gerenciamento seguro de entradas, saídas, categorias e visualização de resumos financeiros com gráficos interativos e exportação de relatórios.

---

## 📌 Funcionalidades

- **Autenticação Segura (JWT):** Cadastro, login e sessão protegida com tokens JWT enviados via cabeçalho `Bearer`.
- **Gestão Completa de Transações (CRUD):** Criação, listagem, edição e exclusão de receitas e despesas vinculadas isoladamente a cada usuário.
- **Dashboard Financeiro:**
  - Cálculo automático de Total de Entradas, Total de Saídas e Saldo Total.
  - Filtros avançados por mês/ano, busca por texto, categoria e tipo de conta.
  - Gráfico de rosca interativo por categoria de despesa via Chart.js.
- **Exportação de Dados:** Exportação de relatórios em formatos **CSV** (com suporte a acentuação no Excel) e **PDF**.
- **Interface e UX:** Alternância de temas, suporte a máscaras monetárias (BRL), alertas Toast e modais de confirmação.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
- **HTML5** & **CSS3** (Flexbox/Grid, variáveis CSS, temas)
- **JavaScript (ES6+)**
- **Chart.js** (Renderização de gráficos)
- **html2pdf.js** (Geração de relatórios em PDF)

### **Back-end**
- **Java 17/21**
- **Spring Boot 3.x**
  - Spring Security (Autenticação e Autorização via JWT)
  - JJWT (`io.jsonwebtoken`)
  - Spring Data JPA
  - Spring Web (REST API)
  - Bean Validation
- **Lombok**

### **Banco de Dados**
- **PostgreSQL / MySQL**
- **Hibernate / JPA**

---

## 📂 Estrutura do Projeto

```text
financias/
├── front-end/
│   ├── index.html          # Tela principal (Planilha e Dashboard)
│   ├── login.html          # Tela de Autenticação
│   ├── style.css           # Estilização global e temas
│   ├── main.js             # Lógica das transações, filtros e exportações
│   └── auth.js             # Lógica de login e cadastro
│
└── back-end/
    └── planilha-financeira/
        ├── src/main/java/com/financeiro/planilha_financeira/
        │   ├── controller/ # REST Controllers (TransacaoController, UsuarioController)
        │   ├── dto/        # DTOs de entrada e saída (DadosCadastroTransacao, etc.)
        │   ├── model/      # Entidades JPA (Transacao, Usuario)
        │   ├── repository/ # Interfaces Spring Data JPA
        │   ├── security/   # SecurityFilter, TokenService e configurações de JWT
        │   └── service/    # Camada de Regras de Negócio (TransacaoService)
        └── src/main/resources/
            ├── application.properties.example # Modelo público de propriedades
            └── application.properties         # Configurações locais (ignorado no Git)

```

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**

* **JDK 17** ou superior instalado
* **PostgreSQL** ou **MySQL Server** em execução
* **Maven** (ou wrapper `./mvnw`)
* Navegador web atualizado

---

### **1. Configuração do Banco de Dados**

Crie o banco de dados na sua instância relacional:

```sql
CREATE DATABASE planilha_financeira;

```

---

### **2. Configuração e Execução do Back-end**

1. Navegue até a pasta do backend:
```bash
cd back-end/planilha-financeira

```


2. Crie o arquivo `application.properties` em `src/main/resources/` baseando-se no arquivo `.example`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/planilha_financeira
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha

# Segredo para assinatura de Tokens JWT
api.security.token.secret=${JWT_SECRET:chave_secreta_para_desenvolvimento_local_123456}

```


3. Execute a aplicação Spring Boot:
```bash
./mvnw spring-boot:run

```


> *(A API estará disponível em `http://localhost:8080`)*



---

### **3. Execução do Front-end**

1. Navegue até a pasta `front-end`.
2. Abra o arquivo `login.html` utilizando a extensão **Live Server** no VS Code (ou diretamente no navegador).
3. Cadastre um novo usuário e faça login para ser redirecionado ao dashboard.

---

## 📡 Endpoints da API

### **Autenticação (`/api/usuarios`)**

* `POST /api/usuarios/cadastrar` — Registra um novo usuário no sistema.
* `POST /api/usuarios/login` — Autentica o usuário e retorna o token JWT.

### **Transações (`/api/transacoes`)** *(Requer Token Bearer)*

* `GET /api/transacoes` — Lista todas as transações pertencentes ao usuário autenticado.
* `POST /api/transacoes` — Cadastra uma nova transação associada ao usuário autenticado.
* `PUT /api/transacoes/{id}` — Atualiza os dados de uma transação existente (valida propriedade).
* `DELETE /api/transacoes/{id}` — Remove uma transação pelo ID (valida propriedade).

---

## 🛡️ Segurança e Variáveis de Ambiente

* As requisições para a API de transações exigem o cabeçalho `Authorization: Bearer <token_jwt>`.
* O arquivo `application.properties` contendo credenciais de banco e chaves secretas está configurado no `.gitignore` para prevenir vazamentos de dados em repositórios públicos.

```

```