# Stage 1: Build the React app
FROM node:18

# Set working directory
WORKDIR /home/family/frontend

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the Vite app
RUN npm run build
