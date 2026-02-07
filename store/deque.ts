export class DequeNode<T>{
    value:T;
    prev?:DequeNode<T>;
    next?:DequeNode<T>;
    constructor(value:T){
        this.value = value
    }
}

export class Deque<T>{
    private head?: DequeNode<T>;
    private tail?: DequeNode<T>;
    private _size:number = 0;

    lpush(value:T){
         const node = new DequeNode(value);
        if(!this.head){
            this.head = this.tail = node;
        }else{
            node.next = this.head;
            this.head.prev = node;
            this.head = node
        }
        this._size++;
    }
    
    rpush(value:T){
         const node = new DequeNode(value);
        if(!this.tail){
            this.head = this.tail = node;
        }else{
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        this._size++;
    }
    
    lpop(): T | null{
        if(!this.head){
            return null;
        }
        const node = this.head;
        this.head = this.head.next;
        if(this.head){
            this.head.prev = undefined;
        }else{
            this.tail = undefined;
        }
        this._size--;
        return node.value;
    }
    
    rpop(): T | null{
        if(!this.tail){
            return null;
        }
        const node = this.tail;
        this.tail = this.tail.prev;
        if(this.tail){
            this.tail.next = undefined;
        }else{
            this.head = undefined;
        }
        this._size--;
        return node.value;
    }
    
    get size(){
        return this._size;
    }
    
    toArray():T[]{
        const result:T[] = [];
        let current = this.head;
        while(current){
            result.push(current.value);
            current = current.next;
        }
        return result;
    }
}