const Asset = require('../models/Asset');
const Worker = require('../models/Employee');
const AssetAssignment = require('../models/AssetAssignment');

exports.listAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    const employees = await Worker.find();
    const formattedEmployees = employees.map(emp => ({
      ...emp.toObject(), // Convert Mongoose document to plain object
      name: emp.fullName // Add the 'name' property using the virtual 'fullName'
    }));
    const assignments = await AssetAssignment.find().populate('asset').populate('employee');
    res.render('assets/list', { assets, employees: formattedEmployees, assignments });
  } catch (err) {
    console.error('Error loading assets page:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createAsset = async (req, res) => {
  try {
    let { name, price, quantity } = req.body;
    name = String(name || '').trim();
    price = parseFloat(price);
    quantity = parseInt(quantity);

    if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid asset data' });
    }

    await Asset.create({ name, price, quantity });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error creating asset:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.assignAsset = async (req, res) => {
  try {
    const { assetId, employeeId, month } = req.body;
    let quantity = parseInt(req.body.quantity);

    if (!assetId || !employeeId || !month || isNaN(quantity) || quantity <= 0) {
      return res.status(400).send('Invalid assignment data');
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).send('Asset not found');
    }
    if (asset.quantity < quantity) {
      return res.status(400).send('Not enough quantity in inventory');
    }

    asset.quantity -= quantity;
    await asset.save();

    await AssetAssignment.create({
      asset: assetId,
      employee: employeeId,
      month,
      quantity
    });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error assigning asset:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.editAsset = async (req, res) => {
  try {
    console.log('Edit asset request received:', req.params.id, req.body);
    const { id } = req.params;
    let { name, price, quantity } = req.body;
    name = String(name || '').trim();
    price = parseFloat(price);
    quantity = parseInt(quantity);

    if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Invalid asset data' });
    }

    await Asset.findByIdAndUpdate(id, { name, price, quantity });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error editing asset:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// New controller methods for rented assignments

exports.editRentedAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    let { assetId, employeeId, month, quantity } = req.body;
    assetId = String(assetId || '').trim();
    employeeId = String(employeeId || '').trim();
    month = String(month || '').trim();
    quantity = parseInt(quantity);

    // If quantity is 0, delete the assignment
    if (quantity === 0) {
      // Instead of redirecting, call the delete logic directly
      // First, find the assignment to get its current quantity
      const assignment = await AssetAssignment.findById(id).populate('asset');
      if (assignment) {
        // Return the quantity to the asset's inventory
        const asset = assignment.asset;
        asset.quantity += assignment.quantity;
        await asset.save();
      }
      // Delete the assignment
      await AssetAssignment.findByIdAndDelete(id);
      return res.redirect('/assets');
    }

    if (!assetId || !employeeId || !month || isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Invalid rented assignment data' });
    }

    // Find the existing assignment to get its current quantity
    const existingAssignment = await AssetAssignment.findById(id).populate('asset');
    if (existingAssignment) {
      // Adjust the asset's inventory based on the quantity difference
      const asset = existingAssignment.asset;
      const quantityDifference = existingAssignment.quantity - quantity;
      
      // If we're increasing the quantity (quantityDifference < 0), check if there are enough assets
      if (quantityDifference < 0 && asset.quantity < Math.abs(quantityDifference)) {
        return res.status(400).send('Not enough quantity in inventory');
      }
      
      asset.quantity += quantityDifference;
      await asset.save();
    }

    await AssetAssignment.findByIdAndUpdate(id, { asset: assetId, employee: employeeId, month, quantity });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error editing rented assignment:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deleteRentedAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    // First, find the assignment to get its current quantity
    const assignment = await AssetAssignment.findById(id).populate('asset');
    if (assignment) {
      // Return the quantity to the asset's inventory
      const asset = assignment.asset;
      asset.quantity += assignment.quantity;
      await asset.save();
    }
    // Delete the assignment
    await AssetAssignment.findByIdAndDelete(id);
    res.redirect('/assets');
  } catch (err) {
    console.error('Error deleting rented assignment:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createRentedAssignment = async (req, res) => {
  try {
    let { assetId, employeeId, month, quantity } = req.body;
    assetId = String(assetId || '').trim();
    employeeId = String(employeeId || '').trim();
    month = String(month || '').trim();
    quantity = parseInt(quantity);

    if (!assetId || !employeeId || !month || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid rented assignment data' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).send('Asset not found');
    }
    if (asset.quantity < quantity) {
      return res.status(400).send('Not enough quantity in inventory');
    }

    asset.quantity -= quantity;
    await asset.save();

    await AssetAssignment.create({ asset: assetId, employee: employeeId, month, quantity });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error creating rented assignment:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
