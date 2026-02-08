import path from "path";
import fs from "fs";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const AOF_PATH = path.join(STORAGE_DIR, "AOF.log");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Commands that modify data and should be persisted
const WRITE_COMMANDS = new Set([
    'SET', 'DEL', 'INCR', 'DECR', 'MSET', 'EXPIRE',
    'LPUSH', 'RPUSH', 'LPOP', 'RPOP'
]);

export class AOF {
    private stream = fs.createWriteStream(AOF_PATH, { flags: "a" });

    append(command: string) {
        this.stream.write(command + "\n");
    }

    close() {
        this.stream.end();
    }

    shouldPersist(command: string): boolean {
        return WRITE_COMMANDS.has(command.toUpperCase());
    }

    load(): string[] {
        try {
            if (!fs.existsSync(AOF_PATH)) {
                console.log('No AOF file found, starting fresh');
                return [];
            }

            const data = fs.readFileSync(AOF_PATH, 'utf8');
            const commands = data.split('\n').filter(line => line.trim() !== '');
            console.log(`Loaded ${commands.length} commands from AOF`);
            return commands;
        } catch (error) {
            console.error('Failed to load AOF:', error);
            return [];
        }
    }

    clear() {
        try {
            if (fs.existsSync(AOF_PATH)) {
                fs.unlinkSync(AOF_PATH);
            }
        } catch (error) {
            console.error('Failed to clear AOF:', error);
        }
    }
}

export const aof = new AOF();