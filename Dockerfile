FROM node
WORKDIR /app
COPY package.json .
RUN npm install

ARG NODE_ENV
RUN chown -R node /app/node_modules
RUN npm install
RUN apt-get update && apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
COPY . ./
ENV PORT 8000
EXPOSE $PORT
CMD ["npm", "start"]