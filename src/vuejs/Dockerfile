# Starting from the LTS version of Node.js
FROM node:lts

# Update and upgrade the packages of the OS
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y fswatch rsync

# Set the work directory to /app
WORKDIR /app

# Install Vue CLI globally
RUN npm install -g @vue/cli

# Copy the script to the image
COPY syncFolder.sh /app/syncFolder.sh
RUN chmod +x /app/syncFolder.sh
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh


# Expose port 4200 for the app
EXPOSE 8080

ENTRYPOINT ["sh", "/app/start.sh"]
