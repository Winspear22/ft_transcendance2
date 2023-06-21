# Starting from the LTS version of Node.js
FROM node:lts

# Update and upgrade the packages of the OS
RUN apt-get update && apt-get upgrade -y

# Set the work directory to /app
WORKDIR /app

# Install Vue CLI globally
RUN npm install -g @vue/cli

# Expose port 4200 for the app
EXPOSE 8080

# First install dependencies, then build the project
ENTRYPOINT ["/bin/sh", "-c", "npm install && npm run serve"]
