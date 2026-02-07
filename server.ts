import * as net from 'net'; 
import { handle_command } from './parser';
import { StartTTLWorker } from './store/ttl';

StartTTLWorker();

const PORT = 8080;
let activeConnections = 0;

const server = net.createServer((socket) => {
    activeConnections++;
    console.log(`Client connected. Active connections: ${activeConnections}`);
    socket.setEncoding('utf8');

    socket.on("data",(data)=>{    
        try{
            const commands = data.toString().split("\n");
            for (const cmd of commands) {
                if (!cmd.trim()) continue;
                const response = handle_command(cmd.trim());
                socket.write(response + "\n");
            }
        }catch(error){
            console.error('Error processing command:', error);
            socket.write("ERROR: internal server error\n");
        }
    });

    socket.on("end",()=>{
        activeConnections--;
        console.log(`Client disconnected. Active connections: ${activeConnections}`);
    });

    socket.on("error", (err) => {
        console.error('Socket error:', err);
        activeConnections--;
    });
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(PORT,()=>{
    console.log(`Mini-Redis server running on port ${PORT}`);
    console.log('Ready to accept connections...');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});