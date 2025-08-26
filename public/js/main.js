document.addEventListener('DOMContentLoaded', () => {
    const employeeSelect = document.getElementById('employee-select');
    const addEmployeeForm = document.getElementById('add-employee-form');
    const calculatePayrollForm = document.getElementById('calculate-payroll-form');
    const resultsContainer = document.getElementById('payroll-results-container');
    const historyContainer = document.getElementById('payroll-history-container');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');

    const now = new Date();
    monthInput.value = now.getMonth() + 1;
    yearInput.value = now.getFullYear();

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/public-employees');
            const { data: employees } = await res.json();

            employeeSelect.innerHTML = '<option value="">-- Select an Employee --</option>';

            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp._id;
                option.textContent = `${emp.fullName} (${emp.employeeId})`;
                employeeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            employeeSelect.innerHTML = '<option value="">Error loading employees</option>';
        }
    };

    const calculateAssetDeduction = async (employeeId, month, year) => {
        if (!employeeId || !month || !year) {
            return 0;
        }

        try {
            const response = await fetch('/api/payroll/asset-deduction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    month: parseInt(month),
                    year: parseInt(year)
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                return result.assetsDeduction;
            } else {
                console.error('Failed to calculate asset deduction:', result.message);
                return 0;
            }
        } catch (error) {
            console.error('Error calculating asset deduction:', error);
            return 0;
        }
    };

    const fetchAndDisplayHistory = async (employeeId) => {
        if (!employeeId) {
            historyContainer.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/payroll/history/${employeeId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch payroll history');
            }

            if (result.data && result.data.length > 0) {
                displayHistory(result.data);
            } else {
                historyContainer.innerHTML = '<p>No payroll history found for this employee.</p>';
            }
        } catch (error) {
            console.error('Failed to fetch payroll history:', error);
            historyContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading payroll history. Please try again.</p>
                    <p><small>${error.message || ''}</small></p>
                </div>`;
        }
    };

    const displayHistory = (history) => {
        if (!history || history.length === 0) {
            historyContainer.innerHTML = '<p>No payroll history found.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'history-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Month/Year</th>
                    <th>Days Worked</th>
                    <th>Base Pay</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        
        history.forEach(record => {
            const row = document.createElement('tr');
            const date = new Date(record.year, record.month - 1);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            row.innerHTML = `
                <td>${monthYear}</td>
                <td>${record.daysWorked}</td>
                <td>₹${record.basePay.toFixed(2)}</td>
                <td>₹${record.totalDeductions.toFixed(2)}</td>
                <td>₹${record.netPay.toFixed(2)}</td>
            `;
            
            row.addEventListener('click', () => {
                displayPayrollDetails(record);
            });
            
            tbody.appendChild(row);
        });

        historyContainer.innerHTML = '';
        historyContainer.appendChild(table);
    };

    const displayPayrollDetails = (record) => {
        const details = `
            <div class="payroll-details">
                <h4>Payroll Details</h4>
                <p><strong>Month/Year:</strong> ${new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                <p><strong>Days Worked:</strong> ${record.daysWorked}</p>
                
                <h5>Earnings</h5>
                <p>Base Pay: ₹${record.basePay.toFixed(2)}</p>
                <p>Paid Leave Pay: ₹${record.paidLeavePay.toFixed(2)}</p>
                <p>OT Pay: ₹${record.otPay.toFixed(2)}</p>
                <p><strong>Gross Salary:</strong> ₹${record.grossSalary.toFixed(2)}</p>
                
                <h5>Deductions</h5>
                <p>PF (${record.pfPercentage}%): ₹${record.pfDeduction.toFixed(2)}</p>
                <p>ESI (${record.esiPercentage}%): ₹${record.esiDeduction.toFixed(2)}</p>
                <p>Advance Deduction: ₹${record.advanceDeduction.toFixed(2)}</p>
                <p>Assets Deduction: ₹${record.assetsDeduction.toFixed(2)}</p>
                <p><strong>Total Deductions:</strong> ₹${record.totalDeductions.toFixed(2)}</p>
                
                <h4>Net Pay: ₹${record.netPay.toFixed(2)}</h4>
            </div>
        `;
        
        historyContainer.insertAdjacentHTML('beforeend', details);
    };

    employeeSelect.addEventListener('change', async (e) => {
        const employeeId = e.target.value;
        resultsContainer.innerHTML = '';
        fetchAndDisplayHistory(employeeId);
        
        // Update asset deduction when employee is selected
        const assetsDeductionInput = document.getElementById('assetsDeduction');
        const month = monthInput.value;
        const year = yearInput.value;
        
        if (employeeId && month && year) {
            const deduction = await calculateAssetDeduction(employeeId, month, year);
            assetsDeductionInput.value = deduction;
        }
    });

    // Update asset deduction when month is changed
    monthInput.addEventListener('change', async () => {
        const employeeId = employeeSelect.value;
        const month = monthInput.value;
        const year = yearInput.value;
        const assetsDeductionInput = document.getElementById('assetsDeduction');
        
        if (employeeId && month && year) {
            const deduction = await calculateAssetDeduction(employeeId, month, year);
            assetsDeductionInput.value = deduction;
        }
    });

    

    calculatePayrollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(calculatePayrollForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/payroll/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    daysWorked: parseFloat(data.daysWorked),
                    advanceDeduction: parseFloat(data.advanceDeduction) || 0,
                    assetsDeduction: parseFloat(data.assetsDeduction) || 0,
                    pfPercentage: parseFloat(data.pfPercentage) || 0,
                    esiPercentage: parseFloat(data.esiPercentage) || 0,
                    month: parseInt(data.month),
                    year: parseInt(data.year)
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                displayPayrollResults(result.data);
                fetchAndDisplayHistory(data.employeeId);
            } else {
                throw new Error(result.message || 'Failed to calculate payroll');
            }
        } catch (error) {
            console.error('Error calculating payroll:', error);
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error calculating payroll. Please try again.</p>
                    <p><small>${error.message || ''}</small></p>
                </div>`;
        }
    });

    const displayPayrollResults = (data) => {
        resultsContainer.innerHTML = `
            <div class="payroll-results">
                <h3>Payroll Calculation Results</h3>
                <p><strong>Employee:</strong> ${data.employeeName} (${data.employeeId})</p>
                <p><strong>Period:</strong> ${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                
                <div class="earnings">
                    <h4>Earnings</h4>
                    <p>Base Pay (${data.daysWorked} days): ₹${data.basePay.toFixed(2)}</p>
                    ${data.paidLeavePay > 0 ? `<p>Paid Leave Pay: ₹${data.paidLeavePay.toFixed(2)}</p>` : ''}
                    ${data.otPay > 0 ? `<p>OT Pay: ₹${data.otPay.toFixed(2)}</p>` : ''}
                    <p class="total"><strong>Gross Salary:</strong> ₹${data.grossSalary.toFixed(2)}</p>
                </div>
                
                <div class="deductions">
                    <h4>Deductions</h4>
                    <p>PF (${data.pfPercentage}%): ₹${data.pfDeduction.toFixed(2)}</p>
                    <p>ESI (${data.esiPercentage}%): ₹${data.esiDeduction.toFixed(2)}</p>
                    ${data.advanceDeduction > 0 ? `<p>Advance Deduction: ₹${data.advanceDeduction.toFixed(2)}</p>` : ''}
                    ${data.assetsDeduction > 0 ? `<p>Assets Deduction: ₹${data.assetsDeduction.toFixed(2)}</p>` : ''}
                    <p class="total"><strong>Total Deductions:</strong> ₹${data.totalDeductions.toFixed(2)}</p>
                </div>
                
                <div class="net-pay">
                    <h3>Net Pay: ₹${data.netPay.toFixed(2)}</h3>
                </div>
                
                <p class="success-message">Payroll calculated and saved successfully!</p>
            </div>
        `;
    };

    fetchEmployees();
});
