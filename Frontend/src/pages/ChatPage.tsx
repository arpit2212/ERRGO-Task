// ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: string; // Changed from Date to string for JSON parsing
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Function to get the appropriate WebSocket URL
  const getWebSocketUrl = (): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    
    // For development, use localhost
    const wsHostname = process.env.NODE_ENV === 'development' || hostname === 'localhost'
      ? 'localhost'
      : hostname;
      
    return `${protocol}//${wsHostname}:3000/`;
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection setup with reconnection logic
  const connectWebSocket = () => {
    const wsUrl = getWebSocketUrl();
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data:', data); // Debug log
        
        if (data.type === 'history') {
          // Load existing messages
          setMessages(data.messages || []);
        } else if (data.type === 'message') {
          // Add new message
          setMessages(prev => [...prev, data.data]);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('Disconnected from WebSocket server', event.code, event.reason);
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds if not manually closed
      if (event.code !== 1000) {
        console.log('Attempting to reconnect in 3 seconds...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  // Initial connection setup
  useEffect(() => {
    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Send message to server
    const messageData = {
      type: 'chat',
      message: inputMessage.trim()
    };
    
    console.log('Sending message:', messageData); // Debug log
    wsRef.current.send(JSON.stringify(messageData));

    // Clear input
    setInputMessage('');
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Manual reconnect function
  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chat Room</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {!isConnected && (
              <button
                onClick={handleReconnect}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-gray-800 flex-1 break-words">{msg.message}</p>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};