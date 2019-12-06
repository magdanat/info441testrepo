FROM nginx
ADD default.conf /etc/nginx/conf.d/default.conf
WORKDIR /app
COPY . .
CMD ["npm", "start"]