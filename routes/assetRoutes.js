const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.listAssets);
router.post('/assign', assetController.assignAsset);
router.post('/create', assetController.createAsset);
router.post('/edit/:id', assetController.editAsset);

// New routes for rented assignments
router.post('/rented/edit/:id', assetController.editRentedAssignment);
router.post('/rented/delete/:id', assetController.deleteRentedAssignment);
router.post('/rented/create', assetController.createRentedAssignment);

module.exports = router;
