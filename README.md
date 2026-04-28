# MMI - Moraes Mendes Imóveis - Plataforma Web

Este repositório contém o código-fonte completo para a plataforma web da Moraes Mendes Imóveis, incluindo o site voltado para o cliente, o painel administrativo e o serviço de backend.

## Visão Geral da Arquitetura

O projeto é um monorepo dividido em três componentes principais:

1.  **`frontend/`**: Uma aplicação Next.js que serve como o site principal para os clientes. Ele exibe os imóveis, permite a busca e fornece informações sobre a empresa.
2.  **`mmi-admin/`**: Uma aplicação Next.js separada que funciona como um painel administrativo para gerenciar imóveis, leads (CRM) e outras operações internas (ERP).
3.  **`backend/`**: Uma API RESTful construída com Spring Boot (Java) que serve dados para as aplicações `frontend` e `mmi-admin`, além de gerenciar a lógica de negócios e a persistência de dados.

---

## 🚀 Tecnologias Utilizadas

| Componente     | Tecnologias Principais                                                                                             |
| :------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Backend**    | Java 21, Spring Boot, Spring Security, Maven, JPA/Hibernate                                                        |
| **Frontend**   | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui                                                                |
| **Admin**      | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui                                                                |
| **Deployment** | Vercel (para os frontends), Docker (disponível para o backend)                                                     |

---

## 📁 Estrutura do Projeto

```
.
├── backend/      # API em Spring Boot
├── frontend/     # Website principal em Next.js
└── mmi-admin/    # Painel administrativo em Next.js
```

---

## 🛠️ Configuração e Execução

### Pré-requisitos

*   Node.js (v18 ou superior)
*   `pnpm` (gerenciador de pacotes para os projetos frontend)
*   JDK 21 (para o backend)
*   Maven (para o backend)

### 1. Backend (API)

O backend é responsável por servir os dados para os frontends.

```bash
# Navegue até o diretório do backend
cd backend

# Instale as dependências e construa o projeto com Maven
./mvnw clean install

# Execute a aplicação Spring Boot
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

### 2. Frontend (Site Principal)

Este é o site que os clientes verão.

```bash
# Navegue até o diretório do frontend
cd frontend

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm dev
```

O site estará disponível em `http://localhost:3000`.

### 3. MMI-Admin (Painel Administrativo)

Este é o painel para gerenciamento interno.

```bash
# Navegue até o diretório do painel administrativo
cd mmi-admin

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm dev
```

O painel administrativo estará disponível em `http://localhost:3001` (ou outra porta, se a 3000 já estiver em uso).

---

## 🌐 Endpoints e CORS

O backend ([backend/src/main/java/com/mmi/infra/security/SecurityConfig.java](backend/src/main/java/com/mmi/infra/security/SecurityConfig.java)) está configurado para aceitar requisições das seguintes origens:

*   `http://localhost:3000` (desenvolvimento do frontend)
*   `https://mmi-painel-administrativo.vercel.app` (admin em produção)
*   `https://mmi-bice.vercel.app` (frontend em produção)
*   `https://mmimoraesmendesimoveis.com.br`
*   E outros subdomínios de deploy da Vercel.

Qualquer nova URL de frontend precisa ser adicionada à lista `setAllowedOrigins` no arquivo