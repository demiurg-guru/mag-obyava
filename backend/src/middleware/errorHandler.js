module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'Image file is too large (max 5 MB)' });
  }
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  // Don't leak internal error details (Supabase/Telegram error text, stack
  // traces, etc.) to clients in production — full detail stays in the logs.
  const message = status < 500
    ? (err.message || 'Bad Request')
    : (isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'));
  res.status(status).json({ success: false, error: message });
};
