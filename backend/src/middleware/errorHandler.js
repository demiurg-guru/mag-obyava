module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'Image file is too large (max 5 MB)' });
  }
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
};
