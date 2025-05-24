const { Api_consumer_URL } = process.env

const allowedURLs = {
    Api_consumer_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    all: [Api_consumer_URL]
}

module.exports = allowedURLs