const { Api_consumer_URL, FRONTEND_REDIRECT_URL_LOCAL, SWAGGER_URL_LOCAL } = process.env;

const allowedURLs = {
  origins: [Api_consumer_URL, FRONTEND_REDIRECT_URL_LOCAL, SWAGGER_URL_LOCAL], //used origins instead of all for clarity, removed property Api_consumer_URL was redundant
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], //array is cleaner and clear than string
};

module.exports = allowedURLs;
