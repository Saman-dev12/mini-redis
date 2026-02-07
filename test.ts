import * as net from 'net';
import * as readline from 'readline';

const PORT = 6379;
const HOST = '127.0.0.1';

console.log(`mini-redis-cli ${PORT}`);
console.log('Type "exit" or "quit" to close the connection\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${HOST}:${PORT}> `
});

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log(`Connected to mini-redis server at ${HOST}:${PORT}\n`);
    rl.prompt();
});

client.on("data", (data) => {
    const responses = data.toString().trim().split('\n');
    responses.forEach(response => {
        if (response) console.log(response);
    });
    rl.prompt();
});

client.on("end", () => {
    console.log("\nDisconnected from server");
    rl.close();
    process.exit(0);
});

client.on("error", (err) => {
    console.error(`\nConnection error: ${err.message}`);
    console.error('Make sure the server is running: bun run server.ts');
    rl.close();
    process.exit(1);
});

rl.on('line', (command) => {
    const trimmed = command.trim();
    
    if (!trimmed) {
        rl.prompt();
        return;
    }
    
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log("Bye!");
        client.end();
        return;
    }
    
    client.write(trimmed + '\n');
});

rl.on('close', () => {
    if (client.destroyed === false) {
        client.end();
    }
    process.exit(0);
});
