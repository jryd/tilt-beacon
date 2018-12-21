FROM node:8

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN npm run production

EXPOSE 8080
CMD [ "npm", "start" ]

# Build
# docker build -t jryd/tilt-bleacon-tracker .

# Run
# docker run -it --rm --net=host --privileged -p 8080:8080 -d jryd/tilt-bleacon-tracker