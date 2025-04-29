const requestLogger = (req, res, next) => {
  const timeStamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  console.log(`[${timeStamp}] ${method} ${url}`);

  next();
};

module.exports = { requestLogger };
