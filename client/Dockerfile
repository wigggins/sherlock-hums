# Use node base image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the port used by Vite (default 5173)
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev"]
