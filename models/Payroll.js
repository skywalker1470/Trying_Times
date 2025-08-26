const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    month: {
        type: Number, // e.g., 7 for July
        required: true
    },
    year: {
        type: Number, // e.g., 2025
        required: true
    },
    daysWorked: {
        type: Number,
        required: true
    },
    // Earnings
    basePay: { type: Number, required: true },
    paidLeavePay: { type: Number, default: 0 },
    otPay: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },

    // Deductions
    esiDeduction: { type: Number, default: 0 },
    pfDeduction: { type: Number, default: 0 },
    advanceDeduction: { type: Number, default: 0 },
    assetsDeduction: { type: Number, default: 0 },
    totalDeductions: { type: Number, required: true },

    // Final Pay
    netPay: { type: Number, required: true },
    pfPercentage: { type: Number, required: true },
    esiPercentage: { type: Number, required: true }
}, { timestamps: true });

// Ensure that each employee has only one payroll record per month/year
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
