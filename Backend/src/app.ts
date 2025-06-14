import express from 'express';
import cors from 'cors';
import { IProject, projectSchema } from './models/project.interface';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 3000;

const server = createServer(app);
const wss = new WebSocketServer({ server });

// List of projects
const projects: IProject[] = [];

// Chat message storage
interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
}

const chatMessages: ChatMessage[] = [];

// Setup cors and express.json()
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Errgo Backend Interview Module Loaded Successfully!');
});

// Create a new project
app.post('/projects', (req: Request, res: Response): void => {
  const { project } = req.body;
  console.log('Project data received:', project);
  
  const parseResult = projectSchema.safeParse(project);

  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  // Create new project with unique ID using uuid package
  const newProject: IProject = {
    id: uuid(),
    name: project.name,
    description: project.description
  };

  projects.push(newProject);

  res.status(200).json(newProject);
});

// Get all projects
app.get('/projects', (_req, res) => {
  res.status(200).json(projects);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send existing chat messages to new client
  ws.send(JSON.stringify({
    type: 'history',
    messages: chatMessages
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const messageData = JSON.parse(data.toString());

      if (messageData.type === 'chat') {
        // Create new chat message
        const newMessage: ChatMessage = {
          id: uuid(),
          message: messageData.message,
          timestamp: new Date()
        };

        // Store message
        chatMessages.push(newMessage);

        // Broadcast message to all connected clients
        const broadcastData = JSON.stringify({
          type: 'message',
          data: newMessage
        });

        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(broadcastData);
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});