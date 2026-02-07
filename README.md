# Mini-Redis

A lightweight Redis-like in-memory key-value store implementation in TypeScript.

## Features

- **String Operations**: SET, GET, DEL
- **Existence Check**: EXISTS
- **Numeric Operations**: INCR, DECR
- **Multi Operations**: MGET, MSET
- **TTL Support**: SET with EX, TTL, EXPIRE commands
- **Key Management**: KEYS command
- **List Operations**: LPUSH, RPUSH, LPOP, RPOP, LRANGE, LLEN
- **Type Checking**: TYPE command
- **Automatic TTL Cleanup**: Background worker for expired key cleanup
- **TCP Server**: Network-accessible via TCP connection on port 6379
- **Docker Support**: Run like real Redis with Docker

## Installation

```bash
bun install
```

## Docker Usage (Recommended)

### Quick Start - Pull and Run

```bash
docker run -d -p 6379:6379 --name mini-redis ghcr.io/saman-dev12/mini-redis:latest
```

Then connect:
```bash
docker exec -it mini-redis bun run test.ts
```

### Build from Source

### Start the server with Docker Compose

```bash
docker-compose up -d
```

The server will run on port 6379 (Redis default port).

### Use the Redis CLI

Connect to the running container:

```bash
docker exec -it mini-redis bun run test.ts
```

**Optional: Create an alias for easier access**

**On Windows (PowerShell) - Add to your PowerShell profile:**
```powershell
function redis-cli { docker exec -it mini-redis bun run test.ts }
```

**On Linux/Mac - Add to ~/.bashrc or ~/.zshrc:**
```bash
alias redis-cli='docker exec -it mini-redis bun run test.ts'
```

After adding the alias, restart your terminal and simply type:
```bash
redis-cli
```

### Stop the server

```bash
docker-compose down
```

## Local Development (Without Docker)

## Quick Start

**Terminal 1** - Start the server:
```bash
bun run server
```

**Terminal 2** - Connect with the CLI:
```bash
bun run cli
```

Now you can type Redis commands directly!

## Usage

### Start the Server

```bash
bun run server
# or
bun run server.ts
```

The server will start on port 6379.

### Connect with Redis CLI

```bash
bun run cli
# or
bun run test.ts
```

This provides an interactive Redis-like CLI where you can type commands directly:

```
mini-redis-cli
Type "exit" or "quit" to close the connection

Connected to mini-redis server at 127.0.0.1:6379

127.0.0.1:6379> SET user:1 alice
OK
127.0.0.1:6379> GET user:1
alice
127.0.0.1:6379> INCR counter
1
127.0.0.1:6379> INCR counter
2
127.0.0.1:6379> exit
Bye!
```

### Run Automated Tests

```bash
bun run test
# or
bun run test-commands.ts
```

This runs a suite of predefined commands to test all functionality.

## Supported Commands

### String Commands

- `SET key value` - Set a key to hold a string value
- `SET key value EX seconds` - Set a key with expiration time in seconds
- `GET key` - Get the value of a key
- `DEL key` - Delete a key
- `EXISTS key` - Check if a key exists (returns 1 or 0)

### Numeric Commands

- `INCR key` - Increment the integer value of a key by 1
- `DECR key` - Decrement the integer value of a key by 1

### Multi Commands

- `MSET key1 value1 key2 value2 ...` - Set multiple keys to multiple values
- `MGET key1 key2 ...` - Get the values of multiple keys

### List Commands

- `LPUSH key value` - Insert value at the head of the list
- `RPUSH key value` - Insert value at the tail of the list
- `LPOP key` - Remove and return the first element of the list
- `RPOP key` - Remove and return the last element of the list
- `LRANGE key start stop` - Get a range of elements from the list
- `LLEN key` - Get the length of the list

### TTL Commands

- `TTL key` - Get the remaining time to live in seconds
  - Returns -2 if key doesn't exist
  - Returns -1 if key exists but has no expiration
  - Returns remaining seconds otherwise
- `EXPIRE key seconds` - Set a timeout on a key

### Key Management

- `KEYS` - Get all keys in the store
- `TYPE key` - Determine the type of value stored at key (returns: string, list, or none)

## Examples

```bash
> SET name alice
OK

> GET name
alice

> SET counter 10
OK

> INCR counter
11

> INCR counter
12

> DECR counter
11

> MSET user1 bob user2 charlie user3 dave
OK

> MGET user1 user2 user3
bob,charlie,dave

> SET temp myvalue EX 10
OK

> TTL temp
9

> EXISTS temp
1

> DEL temp
temp deleted

> EXISTS temp
0

> KEYS
name,counter,user1,user2,user3

> LPUSH tasks "buy milk"
1

> LPUSH tasks "walk dog"
2

> RPUSH tasks "clean house"
3

> LRANGE tasks 0 -1
walk dog,buy milk,clean house

> LPOP tasks
walk dog

> LLEN tasks
2
```

## Architecture

- **server.ts** - TCP server implementation with connection management
- **parser.ts** - Command parser and dispatcher
- **store/cache-store.ts** - In-memory cache implementation
- **store/ttl.ts** - Background worker for TTL cleanup
- **test.ts** - Interactive CLI client
- **test-commands.ts** - Automated test suite

## Error Handling

All commands have proper error handling with descriptive error messages:
- Invalid arguments return appropriate error messages
- Non-integer operations on INCR/DECR return errors
- Missing required parameters are validated

## Graceful Shutdown

Press `Ctrl+C` to gracefully shut down the server, closing all active connections.

---

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
