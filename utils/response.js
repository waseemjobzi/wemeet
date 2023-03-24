function sendSuccess(res, payload, message, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    payload,
  });
}

function sendError(next, message, status) {
  const err = new Error(message || "Something went wrong");
  err.status = status;

  return next(err);
}

module.exports = {
  sendSuccess,
  sendError,
};
