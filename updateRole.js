const mongoose = require('mongoose');
const Employee = require('./models/Employee'); // adjust path as needed
require('dotenv').config();

async function addRoleToEmployees() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
  });

  await Employee.updateMany(
    { role: { $exists: false } },
    { $set: { role: "employee" } }
  );
  
  console.log("All existing employees updated with default role.");
  await mongoose.disconnect();
}

addRoleToEmployees();
