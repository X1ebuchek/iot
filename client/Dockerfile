# устанавливаем официальный образ Node.js
FROM node:19-alpine

# указываем рабочую (корневую) директорию
WORKDIR /app

# копируем основные файлы приложения в рабочую директорию
COPY package.json package-lock.json ./

# устанавливаем указанные зависимости NPM на этапе установки образа
RUN npm install

# после установки копируем все файлы проекта в корневую директорию
COPY . ./

RUN npm install amqplib

CMD npm run start $NUMBER & npm run start1 $PORT1 $NUMBER & npm run start2 $PORT2 $NUMBER & npm run start3 $PORT3 $NUMBER & npm run start4 $PORT4 $NUMBER
