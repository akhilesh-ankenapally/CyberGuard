FROM node:20-alpine

WORKDIR /app

COPY frontend/package.json /app/frontend/package.json
WORKDIR /app/frontend
RUN npm install

COPY frontend /app/frontend
RUN npm run build

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]