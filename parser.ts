import { cache } from "./store/cache-store";
import { aof } from "./persistance";

export const handle_command = (input:string, skipPersistence = false) : string => {
    const parts = input.split(" ");
    const command = parts[0]?.toUpperCase();
    
    switch(command){
        case "SET":{
            const key = parts[1];
            const value = parts[2];

            if(!key || !value){
                return "ERROR: SET requires key and value"
            }

            if(parts[3]?.toUpperCase() === "EX"){
                const ttl = parseInt(parts[4] || "0");
                if(isNaN(ttl) || ttl <= 0){
                    return "ERROR: invalid TTL value";
                }
                return cache.set(key,value,ttl);
            }

            return cache.set(key,value);
        }
        
        case "GET":{
            const key = parts[1];
            if(!key) return "ERROR: GET requires a key";
            
            // Check the type first
            const type = cache.type(key);
            if(type === "none") return "NULL";
            
            if(type === "list"){
                // For lists, return all items
                try{
                    const values = cache.lrange(key, 0, -1);
                    return values.length > 0 ? `[${values.join(", ")}]` : "[]";
                }catch(err){
                    return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
                }
            }
            
            // For strings, use normal get
            return cache.get(key);
        }
        
        case "DEL":{
            const key = parts[1];
            if(!key) return "ERROR: DEL requires a key";
            const response = cache.del(key);
            return response === "1" ? `${key} deleted` : `ERROR: key ${key} not found`;
        }
        
        case "EXISTS":{
            const key = parts[1];
            if(!key) return "ERROR: EXISTS requires a key";
            return cache.exists(key);
        }
        
        case "INCR":{
            const key = parts[1];
            if(!key) return "ERROR: INCR requires a key";
            return cache.incr(key);
        }
        
        case "DECR":{
            const key = parts[1];
            if(!key) return "ERROR: DECR requires a key";
            return cache.decr(key);
        }
        
        case "MGET":{
            const keys = parts.slice(1);
            if(keys.length === 0) return "ERROR: MGET requires at least one key";
            return cache.mget(keys);
        }
        
        case "MSET":{
            const args = parts.slice(1);
            if(args.length === 0 || args.length % 2 !== 0){
                return "ERROR: MSET requires pairs of key-value arguments";
            }
            const keyValues: {key: string, value: string}[] = [];
            for(let i = 0; i < args.length; i += 2){
                const key = args[i];
                const value = args[i + 1];
                if(!key || !value){
                    return "ERROR: MSET requires valid key-value pairs";
                }
                keyValues.push({key, value});
            }
            return cache.mset(keyValues);
        }
        
        case "TTL":{
            const key = parts[1];
            if(!key) return "ERROR: TTL requires a key";
            return cache.ttl(key);
        }
        
        case "EXPIRE":{
            const key = parts[1];
            const seconds = parseInt(parts[2] || "0");
            if(!key) return "ERROR: EXPIRE requires a key";
            if(isNaN(seconds) || seconds <= 0){
                return "ERROR: EXPIRE requires a positive integer";
            }
            return cache.expire(key, seconds);
        }

        case "LPUSH":{
            const key = parts[1];
            const value = parts[2];
            if(!key || !value) return "ERROR: LPUSH requires key and value";
            try{
                const size = cache.lpush(key, value);
                return size.toString();
            }catch(err){
                return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
            }
        }

        case "RPUSH":{
            const key = parts[1];
            const value = parts[2];
            if(!key || !value) return "ERROR: RPUSH requires key and value";
            try{
                const size = cache.rpush(key, value);
                return size.toString();
            }catch(err){
                return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
            }
        }

        case "LPOP":{
            const key = parts[1];
            if(!key) return "ERROR: LPOP requires a key";
            try{
                const value = cache.lpop(key);
                return value ?? "NULL";
            }catch(err){
                return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
            }
        }

        case "RPOP":{
            const key = parts[1];
            if(!key) return "ERROR: RPOP requires a key";
            try{
                const value = cache.rpop(key);
                return value ?? "NULL";
            }catch(err){
                return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
            }
        }

        case "LRANGE":{
            const key = parts[1];
            const start = parseInt(parts[2] || "0");
            const stop = parseInt(parts[3] || "-1");
            if(!key) return "ERROR: LRANGE requires a key";
            if(isNaN(start) || isNaN(stop)){
                return "ERROR: LRANGE requires valid start and stop indices";
            }
            try{
                const values = cache.lrange(key, start, stop);
                return values.length > 0 ? values.join(",") : "(empty)";
            }catch(err){
                return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
            }
        }

        case "LLEN":{
            const key = parts[1];
            if(!key) return "ERROR: LLEN requires a key";
            try{
                const len = cache.llen(key);
                return len.toString();
            }catch(err){
                return err instanceof Error ? `ERROR: ${err.message}` : "ERROR: operation failed";
            }
        }

        case "TYPE":{
            const key = parts[1];
            if(!key) return "ERROR: TYPE requires a key";
            return cache.type(key);
        }
        
        default:
            return "ERROR: unknown command";
    }
}

// Replay commands from AOF on server startup
export function replayAOF(): void {
    const commands = aof.load();
    let successCount = 0;
    let errorCount = 0;
    
    console.log('Replaying AOF commands...');
    
    for (const cmd of commands) {
        try {
            const result = handle_command(cmd, true); // Skip persistence during replay
            if (!result.startsWith('ERROR')) {
                successCount++;
            } else {
                errorCount++;
                console.warn(`Failed to replay command: ${cmd} - ${result}`);
            }
        } catch (error) {
            errorCount++;
            console.error(`Error replaying command: ${cmd}`, error);
        }
    }
    
    console.log(`AOF replay complete: ${successCount} succeeded, ${errorCount} failed`);
}

// Wrapper to handle persistence
export function executeCommand(input: string): string {
    const result = handle_command(input, false);
    
    // Only persist successful write commands
    if (!result.startsWith('ERROR')) {
        const command = input.split(" ")[0]?.toUpperCase();
        if (command && aof.shouldPersist(command)) {
            aof.append(input);
        }
    }
    
    return result;
}