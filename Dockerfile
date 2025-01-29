# Usa uma imagem base do Node.js
FROM node:16

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta 5000
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["npm", "run", "dev"]