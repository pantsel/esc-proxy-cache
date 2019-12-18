
class MemoryCache {

    constructor() {
        this.cache = {};
    }

    async init() {
        setInterval((cache) => {
            Object.keys(cache).forEach(key => {
                if(cache[key].expiration
                    && cache[key].expiration < new Date().getTime() ) {
                    delete cache[key];
                }
            })
        }, 2000, this.cache);

        return this;
    }

    async add(id) {
        this.cache[id] = {};
    }

    async get(id) {
        return this.cache[id];
    }

    async set(id, data, ttl) {
        this.cache[id] = {
            response: data,
            expiration: new Date().getTime( ) + ( ttl || 3000 ),
            ttl: ttl
        };
    }

    async put(id, data, ttl) {
        return this.get(id) || this.set(id, data, ttl);
    }

    async remove(id) {
        delete this.cache[id];
    }

    async flush() {
        this.cache = {};
        return true;
    }
}

module.exports = new MemoryCache();