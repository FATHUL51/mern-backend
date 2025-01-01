const dotenv = require("dotenv");
dotenv.config();

const validateReplies = (req, res, next) => {
  const { replies } = req.body;

  if (!replies || !Array.isArray(replies)) {
    return res
      .status(400)
      .json({ error: "Invalid data format: replies must be an array." });
  }

  const isValid = replies.every(
    (reply) =>
      reply.title &&
      typeof reply.title === "string" &&
      reply.question &&
      typeof reply.question === "string" &&
      reply.message &&
      typeof reply.message === "string" &&
      Number.isInteger(reply.index)
  );

  if (!isValid) {
    return res.status(400).json({
      error:
        "Invalid data format: Each reply must have title, question, message, and index.",
    });
  }

  next();
};

module.exports = validateReplies;
