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