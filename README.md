# Node.js MongoDB Demo App

A modern, self-contained Node.js application with MongoDB integration, featuring a beautiful UI and containerized deployment using Podman.

## 🚀 Features

- **Modern Node.js Backend**: Express.js server with MongoDB integration
- **Beautiful UI**: Responsive web interface with modern design
- **Database Operations**: Create, read, and delete users with real-time updates
- **Health Monitoring**: Live database connection status
- **Containerized**: Podman and podman-compose ready
- **Package Management**: Uses pnpm for faster, more efficient dependency management

## 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [Podman](https://podman.io/) - Container engine
- [podman-compose](https://github.com/containers/podman-compose) - Multi-container orchestration

### Installing Prerequisites

```bash
# Install pnpm
npm install -g pnpm

# Install podman-compose (if not already installed)
pip3 install podman-compose
```

## 🛠️ Quick Start

### Option 1: Using Podman Compose (Recommended)

1. **Clone and setup the project**:

   ```bash
   git clone <your-repo-url>
   cd node-mongo-app
   ```

2. **Start the application stack**:

   ```bash
   pnpm run up
   ```

3. **Access the application**:

   - Open your browser and navigate to `http://localhost:3000`
   - The app will automatically connect to MongoDB and display the connection status

4. **View logs**:

   ```bash
   pnpm run logs
   ```

5. **Stop the application**:
   ```bash
   pnpm run down
   ```

### Option 2: Local Development

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start MongoDB locally** (using podman):

   ```bash
   podman run -d --name mongodb -p 27017:27017 mongo:7.0
   ```

3. **Copy environment file**:

   ```bash
   cp env.example .env
   ```

4. **Start the development server**:

   ```bash
   pnpm run dev
   ```

5. **Access the application**:
   - Open `http://localhost:3000` in your browser

## 📦 Available Scripts

| Script           | Description                           |
| ---------------- | ------------------------------------- |
| `pnpm run dev`   | Start development server with nodemon |
| `pnpm start`     | Start production server               |
| `pnpm run build` | Build podman image                    |
| `pnpm run up`    | Start services using podman-compose   |
| `pnpm run down`  | Stop services using podman-compose    |
| `pnpm run logs`  | View application logs                 |

## 🌐 API Endpoints

The application provides the following REST API endpoints:

| Method   | Endpoint         | Description                           |
| -------- | ---------------- | ------------------------------------- |
| `GET`    | `/api/health`    | Check application and database health |
| `GET`    | `/api/users`     | Get all users                         |
| `POST`   | `/api/users`     | Create a new user                     |
| `DELETE` | `/api/users/:id` | Delete a user by ID                   |

### Example API Usage

```bash
# Check health
curl http://localhost:3000/api/health

# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/USER_ID
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Check what's using port 3000
   lsof -i :3000

   # Kill the process if needed
   kill -9 <PID>
   ```

2. **MongoDB connection issues**:

   ```bash
   # Check if MongoDB container is running
   podman ps

   # Check MongoDB logs
   podman logs mongodb
   ```

3. **Permission issues with Podman**:

   ```bash
   # Start podman socket if needed
   systemctl --user start podman.socket

   # Or run as root
   sudo podman-compose up
   ```

### Logs and Debugging

```bash
# View application logs
pnpm run logs

# View specific service logs
podman-compose logs app
podman-compose logs mongodb

# Follow logs in real-time
podman-compose logs -f app
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nodeapp
```

### Database Configuration

The application uses MongoDB with the following default settings:

- **Database Name**: `nodeapp`
- **Collection**: `users`
- **Port**: `27017`

## 🏗️ Project Structure

```
node-mongo-app/
├── src/
│   └── server.js          # Main application server
├── public/
│   └── index.html         # Frontend UI
├── package.json           # Dependencies and scripts
├── podman-compose.yml     # Multi-container configuration
├── Dockerfile             # Container build instructions
├── env.example            # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚀 Deployment

### Production Deployment

1. **Build the container**:

   ```bash
   pnpm run build
   ```

2. **Deploy using podman-compose**:

   ```bash
   pnpm run up
   ```

3. **Set up a reverse proxy** (optional):
   Configure nginx or traefik to route traffic to the application.

### Scaling

To run multiple instances of the application:

```bash
podman-compose up --scale app=3
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `pnpm test` (if available)
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database powered by [MongoDB](https://www.mongodb.com/)
- Containerized with [Podman](https://podman.io/)
- Package management by [pnpm](https://pnpm.io/)

---

**Happy coding!** 🎉
