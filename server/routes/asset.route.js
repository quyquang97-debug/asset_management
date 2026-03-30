import express from 'express';
import * as assetCtrl from '../controllers/asset.controller';
import isAuthenticated from '../middlewares/authenticate';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: asset
 *     description: Asset operations
 */

router.route('/searchbyCodeOrName/:query')

/**
 * @swagger
 * /assets/searchbyCodeOrName/{query}:
 *   get:
 *     tags:
 *       - asset
 *     summary: "Search assets by code or name"
 *     security:
 *       - Bearer: []
 *     operationId: searchAssetsByCodeOrName
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
        assetCtrl.searchByCodeOrName(req, res);
    });

export default router;
