import express from 'express';
import * as repairRequestCtrl from '../controllers/repairRequest.controller';
import isAuthenticated from '../middlewares/authenticate';
import validate from '../config/joi.validate';
import schema from '../utils/validator';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: repairRequest
 *     description: Repair Request operations
 */

router.route('/search')

/**
 * @swagger
 * /repairRequests/search:
 *   post:
 *     tags:
 *       - repairRequest
 *     summary: "Search repair requests"
 *     security:
 *       - Bearer: []
 *     operationId: searchRepairRequests
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: OK
 */

    .post(isAuthenticated, validate(schema.searchRepairRequests), (req, res) => {
        repairRequestCtrl.search(req, res);
    });

router.route('/')

/**
 * @swagger
 * /repairRequests:
 *   post:
 *     tags:
 *       - repairRequest
 *     summary: "Create a new repair request"
 *     security:
 *       - Bearer: []
 *     operationId: storeRepairRequest
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: OK
 */

    .post(isAuthenticated, validate(schema.storeRepairRequest), (req, res) => {
        repairRequestCtrl.store(req, res);
    })

/**
 * @swagger
 * /repairRequests:
 *   delete:
 *     tags:
 *       - repairRequest
 *     summary: "Bulk delete repair requests"
 *     security:
 *       - Bearer: []
 *     operationId: destroyRepairRequests
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: OK
 */

    .delete(isAuthenticated, validate(schema.bulkDeleteRepairRequests), (req, res) => {
        repairRequestCtrl.destroy(req, res);
    });

router.route('/:id')

/**
 * @swagger
 * /repairRequests/{id}:
 *   get:
 *     tags:
 *       - repairRequest
 *     summary: "Get repair request by ID"
 *     security:
 *       - Bearer: []
 *     operationId: findRepairRequestById
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */

    .get(isAuthenticated, (req, res) => {
        repairRequestCtrl.findById(req, res);
    })

/**
 * @swagger
 * /repairRequests/{id}:
 *   put:
 *     tags:
 *       - repairRequest
 *     summary: "Update repair request by ID"
 *     security:
 *       - Bearer: []
 *     operationId: updateRepairRequest
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: OK
 */

    .put(isAuthenticated, validate(schema.updateRepairRequest), (req, res) => {
        repairRequestCtrl.update(req, res);
    });

router.route('/:id/status')

/**
 * @swagger
 * /repairRequests/{id}/status:
 *   patch:
 *     tags:
 *       - repairRequest
 *     summary: "Update repair request status"
 *     security:
 *       - Bearer: []
 *     operationId: updateRepairRequestStatus
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Invalid transition
 */

    .patch(isAuthenticated, validate(schema.updateRepairRequestStatus), (req, res) => {
        repairRequestCtrl.updateStatus(req, res);
    });

export default router;
