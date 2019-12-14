
class MemoryCache {

    constructor() {
        this.cache = {};
    }

    async init() {
        setInterval((cache) => {
            Object.keys(cache).forEach(key => {
                if(cache[key].expiration < new Date().getTime() ) {
                    delete cache[key];
                }
            })
        }, 2000, this.cache);

        return this;
    }

    async get(id) {
        return this.cache[id];
    }

    async set(id, data, ttl) {
        this.cache[id] = {
            item: data,
            expiration: new Date().getTime( ) + ( ttl || 3000 )
        };
    }

    async getOrSet(id, data, ttl) {
        return this.get(id) || this.set(id, data, ttl);
    }

    async remove(id) {
        delete this.cache[id]
    }
}

module.exports = new MemoryCache()