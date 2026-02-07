import { cache } from "./cache-store";

const SAMPLE_SIZE = 20;
const INTERVAL_MS = 1000;

export function StartTTLWorker(){
    setInterval(()=>{
        let checked = 0;

        for(const key in cache.keys()){
            if(checked >= SAMPLE_SIZE){
                break;
            }

            const entry= cache.getEntry(key);
            if (!entry?.expiresAt) continue;

            if(entry?.expiresAt && entry.expiresAt <= Date.now()){
                cache.del(key);
            }

            checked++;
        }
    },INTERVAL_MS)
}