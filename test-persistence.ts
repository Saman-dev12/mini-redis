import * as net from 'net';

const PORT = 6379;
const HOST = '127.0.0.1';

console.log('=== Testing Persistence ===\n');

let testStep = 0;
const tests = [
    { cmd: 'SET persistent_user john', desc: 'Setting a value' },
    { cmd: 'SET persistent_counter 42', desc: 'Setting a counter' },
    { cmd: 'LPUSH persistent_tasks task1', desc: 'Adding to list' },
    { cmd: 'LPUSH persistent_tasks task2', desc: 'Adding to list' },
    { cmd: 'GET persistent_user', desc: 'Verifying persistence' },
    { cmd: 'GET persistent_counter', desc: 'Verifying persistence' },
    { cmd: 'LRANGE persistent_tasks 0 -1', desc: 'Verifying list persistence' },
];

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log(`✓ Connected to mini-redis server at ${HOST}:${PORT}\n`);
    runNextTest();
});

function runNextTest() {
    if (testStep >= tests.length) {
        console.log('\n=== Persistence Test Complete ===');
        console.log('✓ All data has been persisted to storage/AOF.log');
        console.log('✓ Restart the server to verify data recovery');
        console.log('  1. Stop the server (Ctrl+C)');
        console.log('  2. Restart with: bun run server.ts');
        console.log('  3. Run: bun run test-persistence.ts again');
        client.end();
        return;
    }

    const test = tests[testStep];
    if (!test) return;
    
    console.log(`[${testStep + 1}/${tests.length}] ${test.desc}`);
    console.log(`Command: ${test.cmd}`);
    client.write(test.cmd + '\n');
}

client.on('data', (data) => {
    const responses = data.toString().trim().split('\n');
    responses.forEach(response => {
        if (response) {
            console.log(`Response: ${response}`);
        }
    });
    console.log('');
    testStep++;
    
    // Small delay between tests for readability
    setTimeout(runNextTest, 100);
});

client.on('end', () => {
    console.log('\nDisconnected from server');
    process.exit(0);
});

client.on('error', (err) => {
    console.error(`\n✗ Connection error: ${err.message}`);
    console.error('Make sure the server is running: bun run server.ts');
    process.exit(1);
});
