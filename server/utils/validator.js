import Joi from '@hapi/joi';

export default {
    storeUser:
        Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        }),

    updateUser: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),

    login:
        Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        }),

    searchRepairRequests: Joi.object({
        assetId: Joi.number().integer().optional().allow(null),
        requestedBy: Joi.number().integer().optional().allow(null),
        status: Joi.string().valid('open', 'in_progress', 'done', 'cancelled').optional().allow(null),
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().valid(10, 20, 50, 100).default(10),
        sortField: Joi.string().optional().default('request_date'),
        sortDir: Joi.string().valid('asc', 'desc').optional().default('desc')
    }),

    storeRepairRequest: Joi.object({
        assetId: Joi.number().integer().required(),
        requestedBy: Joi.number().integer().required(),
        description: Joi.string().optional().allow('', null),
        requestDate: Joi.date().iso().max('now').required()
    }),

    updateRepairRequest: Joi.object({
        assetId: Joi.number().integer().required(),
        requestedBy: Joi.number().integer().required(),
        description: Joi.string().optional().allow('', null),
        requestDate: Joi.date().iso().max('now').required()
    }),

    updateRepairRequestStatus: Joi.object({
        status: Joi.string().valid('open', 'in_progress', 'done', 'cancelled').required(),
        repairDate: Joi.when('status', {
            is: 'done',
            then: Joi.date().iso().required(),
            otherwise: Joi.date().iso().optional().allow(null)
        }),
        cost: Joi.number().min(0).optional().allow(null),
        performedBy: Joi.string().max(100).optional().allow('', null),
        description: Joi.string().optional().allow('', null)
    }),

    bulkDeleteRepairRequests: Joi.object({
        ids: Joi.array().items(Joi.number().integer()).min(1).required()
    })

};