
class MemoryCache {

    constructor() {
        this.cache = {};
    }

    init() {
        console.log("Memory scheduler started");

        setInterval((cache, remove) => {
            console.log("Checking for expired keys")
            Object.keys(cache).forEach(key => {
                if(cache[key].expiration < new Date().getTime() ) {
                    console.log("Deleting " + key)
                    delete cache[key]
                }
            })

        }, 2000, this.cache)

    }

    get(id) {
        return this.cache[id];
    }

    initId(id) {
        this.cache[id] = {}
    }

    set(id, data, ttl) {
        console.log('Save to cache')
        this.cache[id] = {
            response: data,
            expiration: new Date().getTime( ) + ( ttl || 10000 )
        };
    }

    getOrSet(id, data, ttl) {
        return this.get(id) || this.set(id, data, ttl);
    }

    remove(id) {
        delete this.cache[id]
    }
}

module.exports = new MemoryCache()