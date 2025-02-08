# Sistema de Gerenciamento de Frota

Sistema backend para gerenciamento de frota com foco no controle de pneus e análise de custos.

## 🚀 Funcionalidades

- Gerenciamento de Veículos
- Sistema de Controle de Pneus
- Análise de Custos
- Acompanhamento de Manutenções
- Notificações por Email
- Autenticação e Autorização de Usuários

## 💻 Tecnologias

- Node.js
- TypeScript
- MySQL
- Jest para Testes
- Autenticação JWT
- Validação com Zod
- Nodemailer

## 🛠️ Instalação

```bash
git clone https://github.com/ricardochomicz/frota-backend.git
cd frota-backend
npm install
```

📚 Documentação da API
Principais Endpoints
/auth - Rotas de autenticação
/vehicles - Gerenciamento de veículos
/tires - Controle de pneus
/maintenance - Registros de manutenção
/cost-analysis - Operações de análise de custos

# Exemplos de Uso
## Autenticação
- POST /auth/login - Realiza login de um usuário
- POST /auth/register - Registra um novo usuário

## Gerenciamento de Veículos
- GET /vehicles - Lista todos os veículos
- POST /vehicles - Adiciona um novo veículo
- PUT /vehicles/:id - Atualiza informações de um veículo
- DELETE /vehicles/:id - Remove um veículo

## Pneus
- GET /tires - Lista todos os pneus
- POST /tires - Adiciona um novo pneu
- PUT /tires/:id - Atualiza informações de um pneu
- DELETE /tires/:id - Remove um pneu

## Manutenções
* GET /maintenance - Lista todos os registros de manutenção
* POST /maintenance - Adiciona um novo registro de manutenção
* PUT /maintenance/:id - Atualiza um registro de manutenção
* DELETE /maintenance/:id - Remove um registro de manutenção

## Análise de Custos
* GET /cost-analysis - Lista todas as análises de custos
* POST /cost-analysis - Cria uma nova análise de custos
* PUT /cost-analysis/:id - Atualiza uma análise de custos
* DELETE /cost-analysis/:id - Remove uma análise de custos


# 📋Cobertura de Testes
* Serviço de Análise de Custos
* Criação de análise de custos
* Listagem com filtros
* Busca individual de registros
* Atualizações
* Operações de exclusão

# 🧪 Executando Testes
Para executar os testes, utilize o comando:
```bash
npx jest
```

# 🐳 Utilizando Docker
Para rodar o projeto utilizando Docker, siga os passos abaixo:

Certifique-se de ter o Docker instalado em sua máquina.
Execute o comando:
```bash
docker-compose up -build
```

# 📂 Estrutura do Projeto
.env
.github/
    workflows/
        ci.yml
.gitignore
docker-compose.yml
Dockerfile
jest.config.js
package.json
README.md
scripts/
    schema.sql
src/
    auth/
        generateAndVerifyToken.ts
    config/
        db.ts
    controllers/
        auth/
        CostAnalysisController.ts
        MaintenanceController.ts
        TiresController.ts
        UserController.ts
        VehicleController.ts
        VehicleTiresController.ts
    index.ts
    middlewares/
        AuthMiddleware.ts
        Validate.ts
    models/
        ...
    routes/
    schemas/
    services/
    tests/
    websocket.ts
tsconfig.json