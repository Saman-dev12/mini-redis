import * as net from 'net';

const client = net.createConnection({ port: 8080 }, () => {
  console.log("Connected to Mini-Redis server\n");
  
  // Basic SET/GET
  client.write("SET name saman\n");
  client.write("GET name\n");
  
  // Update value
  client.write("SET name rahul\n");
  client.write("GET name\n");
  
  // EXISTS command
  client.write("EXISTS name\n");
  
  // INCR/DECR commands
  client.write("SET counter 10\n");
  client.write("INCR counter\n");
  client.write("INCR counter\n");
  client.write("DECR counter\n");
  client.write("GET counter\n");
  
  // MSET/MGET commands
  client.write("MSET user1 alice user2 bob user3 charlie\n");
  client.write("MGET user1 user2 user3\n");
  
  // TTL commands
  client.write("SET temp_key temporary_value EX 5\n");
  client.write("TTL temp_key\n");
  client.write("EXPIRE name 10\n");
  client.write("TTL name\n");
  
  // List commands
  client.write("LPUSH tasks task1\n");
  client.write("LPUSH tasks task2\n");
  client.write("RPUSH tasks task3\n");
  client.write("GET tasks\n");
  client.write("LRANGE tasks 0 -1\n");
  client.write("LLEN tasks\n");
  client.write("LPOP tasks\n");
  client.write("RPOP tasks\n");
  client.write("GET tasks\n");
  
  // TYPE command
  client.write("TYPE name\n");
  client.write("TYPE tasks\n");
  client.write("TYPE nonexistent\n");
  
  // KEYS command
  client.write("KEYS\n");
  
  // DEL command
  client.write("DEL temp_key\n");
  client.write("GET temp_key\n");
  
  // Test non-existent key
  client.write("EXISTS nonexistent\n");
  
  setTimeout(() => {
    client.end();
  }, 1000);
});

client.on("data", (data) => {
  console.log("SERVER:", data.toString().trim());
});

client.on("end", () => {
  console.log("\nConnection closed");
  process.exit(0);
});

client.on("error", (err) => {
  console.error("Client error:", err);
  process.exit(1);
});
