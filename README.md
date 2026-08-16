# 💰 Gerenciador de Finanças Pessoais

Aplicação Full Stack para controle de finanças pessoais, permitindo o gerenciamento de entradas, saídas, categorias e visualização de resumos financeiros com gráficos interativos.

---

## 📌 Funcionalidades

- **Autenticação de Usuários:** Cadastro e login de usuários.
- **Gestão de Transações:** Criação, listagem e exclusão de receitas e despesas.
- **Dashboard Financeiro:**
  - Cálculo automático de Total de Entradas, Total de Saídas e Saldo Total.
  - Filtro por mês/ano.
  - Gráfico de pizza interativo por categoria de despesa.
- **Interface e Tema:** Alternância entre **Modo Claro** e **Modo Escuro** com preferência salva localmente.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
- **HTML5** & **CSS3** (Flexbox/Grid, variáveis CSS, suporte a temas)
- **JavaScript (ES6+)**
- **Chart.js** (Renderização de gráficos)

### **Back-end**
- **Java 17/21**
- **Spring Boot 3.x**
  - Spring Data JPA
  - Spring Web (REST API)
- **Lombok**

### **Banco de Dados**
- **MySQL 8.0**
- **Hibernate / JPA** (Mapeamento O/R)

---

## 📂 Estrutura do Projeto

```text
financias/
├── front-end/
│   ├── index.html          # Tela principal (Planilha e Dashboard)
│   ├── login.html          # Tela de Autenticação
│   ├── style.css           # Estilização global e temas
│   ├── main.js            # Lógica das transações e integração com a API
│   └── auth.js            # Lógica de login e cadastro
│
└── back-end/
    └── planilha-financeira/
        ├── src/main/java/com/financeiro/planilha_financeira/
        │   ├── controller/ # Endpoints da API REST
        │   ├── model/      # Entidades do Banco de Dados (Transacao, Usuario)
        │   └── repository/ # Interfaces de acesso aos dados (JPA)
        └── src/main/resources/
            └── application.properties
```

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**
- **JDK 17** ou superior instalado
- **MySQL Server** e **MySQL Workbench** em execução
- **Maven** (ou wrapper do projeto)
- Navegador web atualizado

---

### **1. Configuração do Banco de Dados**

1. Abra o **MySQL Workbench** ou seu cliente MySQL de preferência.
2. Crie o banco de dados para a aplicação:

```sql
CREATE DATABASE planilha_financeira;
```

---

### **2. Configuração e Execução do Back-end**

1. Navegue até a pasta do backend:

```bash
cd back-end/planilha-financeira
```

2. Configure suas credenciais do MySQL no arquivo `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/planilha_financeira?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

3. Execute a aplicação Spring Boot:

```bash
./mvnw spring-boot:run
```

> *(A API estará rodando em `http://localhost:8080`)*

---

### **3. Execução do Front-end**

1. Navegue até a pasta `front-end`.
2. Abra o arquivo `login.html` no seu navegador (ou utilize a extensão **Live Server** no VS Code).
3. Cadastre uma nova conta e faça o login para acessar a planilha.

---

## 📡 Endpoints da API

### **Usuários (`/api/usuarios`)**
- `POST /api/usuarios/cadastrar` — Cadastra um novo usuário.
- `POST /api/usuarios/login` — Autentica o usuário.

### **Transações (`/api/transacoes`)**
- `GET /api/transacoes` — Lista todas as transações.
- `POST /api/transacoes` — Cria uma nova transação.
- `DELETE /api/transacoes/{id}` — Remove uma transação pelo ID.

---

## 🛡️ Segurança e Variáveis de Ambiente

> **Nota:** Certifique-se de adicionar o arquivo `application.properties` ou suas credenciais sensíveis ao `.gitignore` antes de publicar o projeto em repositórios públicos.
