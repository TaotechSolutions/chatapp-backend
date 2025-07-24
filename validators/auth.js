const Joi = require("joi");

const mongoIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.base": "Invalid Id",
    "string.hex": "Invalid Id",
    "string.length": "Invalid Id",
    "any.required": "Invalid Id",
  }),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required(),
  rememberMe: Joi.boolean().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim(),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.base": "Invalid User Id",
    "string.hex": "Invalid User Id",
    "string.length": "Invalid User Id",
    "any.required": "Invalid User Id",
  }),
  password: Joi.string().min(8).required(),
  token: Joi.string().required(),
});

const verifyEmailSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.base": "Invalid User Id",
    "string.hex": "Invalid User Id",
    "string.length": "Invalid User Id",
    "any.required": "Invalid User Id",
  }),
  token: Joi.string().required()
});

const registrationSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required(),
})

module.exports = {
  loginUserSchema, mongoIdSchema, forgotPasswordSchema,
  resetPasswordSchema, verifyEmailSchema, registrationSchema
};
