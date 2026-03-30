import express from 'express';
import * as employeeCtrl from '../controllers/employee.controller';
import isAuthenticated from '../middlewares/authenticate';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: employee
 *     description: Employee operations
 */

router.route('/searchbyCodeOrName/:query')

/**
 * @swagger
 * /employees/searchbyCodeOrName/{query}:
 *   get:
 *     tags:
 *       - employee
 *     summary: "Search employees by code or name"
 *     security:
 *       - Bearer: []
 *     operationId: searchEmployeesByCodeOrName
 *     parameters:
 *       - name: query
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 */

    .get(isAuthenticated, (req, res) => {
        employeeCtrl.searchByCodeOrName(req, res);
    });

export default router;
