import { Deque } from "./deque";

type ValueType = "string" | "list"
interface CacheEntry{
    type:ValueType
    value:string | Deque<string>,
    expiresAt?:number
}
class Cache{
    private store : Map<string,CacheEntry> = new Map<string,CacheEntry>();
    
    set(key:string,value:string,ttl?:number):string{
        const entry: CacheEntry = {type: "string", value};
        if(ttl){
            entry.expiresAt = Date.now() + ttl * 1000;
        }
        this.store.set(key,entry);
        return "OK"
    }

    get(key:string):string{
        const entry = this.store.get(key);
        if(!entry) return "NULL";
        if(entry?.expiresAt && entry.expiresAt <= Date.now()){
            this.store.delete(key);
            return "NULL";
        }
        if(entry.type !== "string"){
            return "ERROR: value is not a string";
        }
        return entry.value as string;
    }

    del(key:string):string{
        return this.store.delete(key) ? "1" : "0";
    }

    exists(key:string):string{
        const entry = this.store.get(key);
        if(!entry) return "0";
        if(entry?.expiresAt && entry.expiresAt <= Date.now()){
            this.store.delete(key);
            return "0";
        }
        return "1";
    }

    incr(key:string):string{
        const entry = this.store.get(key);
        let currentValue = 0;
        
        if(entry){
            if(entry.expiresAt && entry.expiresAt <= Date.now()){
                this.store.delete(key);
            } else {
                if(entry.type !== "string"){
                    return "ERROR: value is not a string";
                }
                currentValue = parseInt(entry.value as string);
                if(isNaN(currentValue)){
                    return "ERROR: value is not an integer";
                }
            }
        }
        
        const newValue = currentValue + 1;
        this.store.set(key, {type: "string", value: newValue.toString()});
        return newValue.toString();
    }

    decr(key:string):string{
        const entry = this.store.get(key);
        let currentValue = 0;
        
        if(entry){
            if(entry.expiresAt && entry.expiresAt <= Date.now()){
                this.store.delete(key);
            } else {
                if(entry.type !== "string"){
                    return "ERROR: value is not a string";
                }
                currentValue = parseInt(entry.value as string);
                if(isNaN(currentValue)){
                    return "ERROR: value is not an integer";
                }
            }
        }
        
        const newValue = currentValue - 1;
        this.store.set(key, {type: "string", value: newValue.toString()});
        return newValue.toString();
    }

    mget(keys:string[]):string{
        const values = keys.map(key => this.get(key));
        return values.join(",");
    }

    mset(keyValues: {key:string, value:string}[]):string{
        for(const {key, value} of keyValues){
            this.store.set(key, {type: "string", value});
        }
        return "OK";
    }

    ttl(key:string):string{
        const entry = this.store.get(key);
        if(!entry) return "-2";
        if(!entry.expiresAt) return "-1";
        
        const ttlSeconds = Math.ceil((entry.expiresAt - Date.now()) / 1000);
        if(ttlSeconds <= 0){
            this.store.delete(key);
            return "-2";
        }
        return ttlSeconds.toString();
    }

    expire(key:string, seconds:number):string{
        const entry = this.store.get(key);
        if(!entry) return "0";
        
        entry.expiresAt = Date.now() + seconds * 1000;
        this.store.set(key, entry);
        return "1";
    }

    lpush(key:string,value:string){
        let entry = this.store.get(key);
        if(!entry){
            entry = {
                type : "list",
                value: new Deque<string>(),
            }
            this.store.set(key,entry);
        }

        if(entry.type !== "list"){
            throw new Error("WRONGTYPE key is not a list");
        }

        (entry.value as Deque<string>).lpush(value);
        return (entry.value as Deque<string>).size;
    }

    rpush(key:string,value:string){
        let entry = this.store.get(key);
        if(!entry){
            entry = {
                type : "list",
                value : new Deque<string>()
            }
            this.store.set(key,entry);
        }
        if(entry.type !== "list"){
            throw new Error("WRONGTYPE key is not a list");
        }
        (entry.value as Deque<string>).rpush(value);
        return (entry.value as Deque<string>).size;
    }

    lpop(key:string): string | null{
        let entry = this.store.get(key);
        if(!entry) return null;
        if(entry.type !== "list"){
            throw new Error("WRONGTYPE key is not a list");
        }
        const value = (entry.value as Deque<string>).lpop();
        if((entry.value as Deque<string>).size === 0){
            this.store.delete(key);
        }
        return value;
    }

    rpop(key:string): string | null{
        let entry = this.store.get(key);
        if(!entry) return null;
        if(entry.type !== "list"){
            throw new Error("WRONGTYPE key is not a list");
        }
        const value = (entry.value as Deque<string>).rpop();
        if((entry.value as Deque<string>).size === 0){
            this.store.delete(key);
        }
        return value;
    }

    lrange(key:string, start:number, stop:number): string[]{
        let entry = this.store.get(key);
        if(!entry) return [];
        if(entry.type !== "list"){
            throw new Error("WRONGTYPE key is not a list");
        }
        const arr = (entry.value as Deque<string>).toArray();
        const len = arr.length;
        
        // Handle negative indices
        if(start < 0) start = len + start;
        if(stop < 0) stop = len + stop;
        
        // Clamp to valid range
        start = Math.max(0, start);
        stop = Math.min(len - 1, stop);
        
        if(start > stop) return [];
        
        return arr.slice(start, stop + 1);
    }

    llen(key:string): number{
        let entry = this.store.get(key);
        if(!entry) return 0;
        if(entry.type !== "list"){
            throw new Error("WRONGTYPE key is not a list");
        }
        return (entry.value as Deque<string>).size;
    }

    keys() : MapIterator<string>{
        return this.store.keys();
    }

    getEntry(key:string):CacheEntry | undefined{
        return this.store.get(key);
    }

    type(key:string):string{
        const entry = this.store.get(key);
        if(!entry) return "none";
        if(entry.expiresAt && entry.expiresAt <= Date.now()){
            this.store.delete(key);
            return "none";
        }
        return entry.type;
    }
}

export const cache = new Cache();