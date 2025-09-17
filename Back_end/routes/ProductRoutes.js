const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/addAll', productController.addMultipleProducts);
router.post('/in-stock', productController.increaseProductQuantity);
router.post('/out-stock', productController.decreaseProductQuantity);
    
module.exports = router;