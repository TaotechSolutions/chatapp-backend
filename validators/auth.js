const Joi = require('joi');

const mongoIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.base': 'Invalid Id',
        'string.hex': 'Invalid Id',
        'string.length': 'Invalid Id',
        'any.required': 'Invalid Id',
    }),
})

const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

module.exports = { loginUserSchema, mongoIdSchema };