const { Api_consumer_URL, NODE_ENV } = process.env

const allowedURLs = {
    origins: NODE_ENV === 'production' ? [Api_consumer_URL] : "*", //used origins instead of all for clarity, removed property Api_consumer_URL was redundant 
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], //array is cleaner and clear than string
}

module.exports = allowedURLs