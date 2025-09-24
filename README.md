
# Eco-Bot 🌍

A smart chatbot that leverages education to inform users about climate change. Built with vanilla HTML, CSS, JavaScript frontend and Node.js backend, powered by Grok AI for intelligent responses. This project was created as part of a hackathon to help spread awareness and knowledge about environmental issues.

## 🚀 Features

- Interactive chat interface built with vanilla JavaScript
- Real-time climate change education powered by Grok AI
- Clean, responsive design with HTML/CSS
- Node.js backend API for chat processing
- Grok integration for intelligent environmental responses
- Educational content delivery on sustainability topics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** package manager
- **Git** for version control
- **Grok API Key** - [Get from xAI platform](https://console.x.ai/)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/November-R/Eco-Bot.git
   cd Eco-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if using yarn
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Grok API Configuration
   GROK_API_KEY=your_grok_api_key_here
   GROK_API_URL=https://api.x.ai/v1
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # CORS Settings (if needed)
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

   **To get your Grok API key:**
   - Visit [xAI Console](https://console.x.ai/)
   - Sign up/Login to your account
   - Navigate to API keys section
   - Create a new API key
   - Copy the key to your `.env` file

## 🚀 Deployment Options

### Option 1: Local Development

1. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

2. **Serve the frontend**
   ```bash
   # Option 1: Use Node.js to serve static files (if configured)
   # Server should serve static files from public/ or frontend/ directory
   
   # Option 2: Use a simple HTTP server for frontend development
   npx http-server public -p 8080
   # or if you have Python installed
   cd public && python -m http.server 8080
   ```

3. **Access the application**
   - Backend API: `http://localhost:3000`
   - Frontend: `http://localhost:8080` (or the port you configured)

### Option 2: Netlify Deployment (Frontend Only)

1. **Build/Prepare the frontend**
   ```bash
   # Ensure your frontend files are in a 'public' or 'dist' directory
   # Update API endpoints in your JavaScript to point to deployed backend
   ```

2. **Deploy to Netlify**
   - Drag and drop your frontend folder to Netlify
   - Or connect your GitHub repository
   - Set publish directory: `public` or your frontend folder
   - Configure environment variables for API URLs

**Note**: You'll need to deploy your Node.js backend separately (use Heroku, Railway, or Render)

### Option 3: Vercel Deployment (Full-Stack)

1. **Create vercel.json** in root directory:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.js", "use": "@vercel/node" },
       { "src": "public/**/*", "use": "@vercel/static" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/server.js" },
       { "src": "/(.*)", "dest": "/public/$1" }
     ]
   }
   ```

2. **Deploy**
   ```bash
   npm i -g vercel
   vercel
   ```

### Option 4: Heroku Deployment (Backend + Frontend)

1. **Create a Procfile** in root directory:
   ```
   web: node server.js
   ```

2. **Update package.json** with start script:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

3. **Install Heroku CLI** - [Download here](https://devcenter.heroku.com/articles/heroku-cli)

4. **Deploy to Heroku**
   ```bash
   heroku login
   heroku create eco-bot-app
   
   # Set environment variables
   heroku config:set GROK_API_KEY=your_grok_api_key_here
   heroku config:set NODE_ENV=production
   
   # Deploy
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 5: Railway Deployment (Recommended for Node.js)

1. **Connect your GitHub repo** to [Railway](https://railway.app)
2. **Add environment variables** in Railway dashboard
3. **Deploy automatically** - Railway will detect your Node.js app

## 📁 Project Structure

```
Eco-Bot/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── style.css          # CSS styles
│   ├── script.js          # Vanilla JavaScript
│   └── assets/            # Images, icons, etc.
├── server.js              # Node.js backend server
├── routes/                # API routes (optional)
│   └── chat.js           # Chat API endpoints
├── middleware/            # Express middleware
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .env.example          # Environment template
├── Procfile             # For Heroku deployment
├── vercel.json          # For Vercel deployment
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROK_API_KEY` | Your Grok API key from xAI | Yes |
| `GROK_API_URL` | Grok API endpoint URL | Yes |
| `PORT` | Port number for the server | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

### Backend Configuration (server.js)

Your Node.js server should handle:
- Static file serving for frontend
- API endpoints for chat functionality
- Grok API integration
- CORS configuration

Example package.json dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

## 📱 Usage

1. Open the deployed website
2. Start a conversation with the Eco-Bot
3. Ask questions about climate change, environmental issues, or sustainability
4. Learn from the educational responses provided

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill -9
```

**Dependencies not installing**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Grok API not responding**
```bash
# Check your API key is correct
# Verify your API quota/limits
# Check network connectivity
# Review API endpoint URL
```

**CORS errors in browser**
```javascript
// Ensure your server.js has CORS configured:
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

**Frontend not connecting to backend**
- Check if backend server is running
- Verify API endpoints in your JavaScript files
- Check browser developer console for errors
- Ensure correct ports are being used

## 📊 Performance & Best Practices

**Frontend Optimization:**
- Optimize images in the `public/assets` folder
- Minify CSS and JavaScript for production
- Use efficient DOM manipulation techniques
- Implement loading states for API calls

**Backend Optimization:**
- Use compression middleware: `app.use(compression())`
- Implement rate limiting for Grok API calls
- Cache responses when appropriate
- Monitor Grok API usage and quotas

**Deployment Tips:**
- Set `NODE_ENV=production` in production
- Use environment variables for all sensitive data
- Implement proper error handling for API failures
- Set up monitoring for your deployed application

## 🔒 Security

- **Never commit your Grok API key** to the repository
- Use `.env` file for all sensitive configuration
- Add `.env` to your `.gitignore` file
- Implement rate limiting to prevent API abuse
- Validate and sanitize user inputs
- Use HTTPS in production
- Keep Node.js and dependencies updated

## 🔧 Development Tips

**Local Development:**
```bash
# Use nodemon for auto-restart during development
npm install -g nodemon
nodemon server.js

# Or add to package.json scripts:
"dev": "nodemon server.js"
```

**Frontend Development:**
- Use browser developer tools for debugging
- Test responsive design on different screen sizes
- Validate HTML and CSS
- Test chat functionality thoroughly

**Grok Integration:**
- Test different prompts for climate change topics
- Implement proper error handling for API failures
- Consider implementing conversation context
- Monitor API usage and costs

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/November-R/Eco-Bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/November-R/Eco-Bot/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built during a hackathon for climate change awareness
- Thanks to all contributors and supporters of environmental education
- Special thanks to the open-source community

---

**Made with ❤️ for our planet 🌍**
