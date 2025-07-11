// script.js - Complete Working Version
class MedicalCoverageSystem {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.currentSection = 'dashboard';
        this.charts = {};
        this.data = {
            employees: [],
            beneficiaries: [],
            services: [],
            billing: [],
            policies: []
        };
        this.init();
    }

    init() {
        // Wait for DOM and Chart.js to be ready
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded, retrying...');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        this.bindEvents();
        this.initializeCharts();
        this.loadDashboard();
        // Initialize sample data on first load
        this.initializeSampleData();
    }

    async initializeSampleData() {
        try {
            const response = await fetch(`${this.apiUrl}/initialize`, {
                method: 'POST'
            });
            if (response.ok) {
                console.log('Sample data initialized successfully');
            }
        } catch (error) {
            console.log('Sample data already exists or initialization failed');
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal overlay close
        document.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Search functionality
        document.getElementById('employee-search').addEventListener('input', 
            this.debounce(() => this.searchEmployees(), 300));
        document.getElementById('beneficiary-search').addEventListener('input', 
            this.debounce(() => this.searchBeneficiaries(), 300));
        document.getElementById('service-search').addEventListener('input', 
            this.debounce(() => this.searchServices(), 300));

        // Filter functionality
        document.getElementById('beneficiary-filter').addEventListener('change', 
            () => this.filterBeneficiaries());
        document.getElementById('service-type-filter').addEventListener('change', 
            () => this.filterServices());
        document.getElementById('service-date-filter').addEventListener('change', 
            () => this.filterServices());
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        this.showLoading();
        try {
            switch (section) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'employees':
                    await this.loadEmployees();
                    break;
                case 'beneficiaries':
                    await this.loadBeneficiaries();
                    break;
                case 'services':
                    await this.loadServices();
                    break;
                case 'billing':
                    await this.loadBilling();
                    break;
                case 'policies':
                    await this.loadPolicies();
                    break;
            }
        } catch (error) {
            this.showError('Error loading data: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${this.apiUrl}/dashboard`);
            const data = await response.json();
            
            document.getElementById('total-employees').textContent = data.totalEmployees || 0;
            document.getElementById('total-beneficiaries').textContent = data.totalBeneficiaries || 0;
            document.getElementById('total-services').textContent = data.totalServices || 0;
            document.getElementById('total-billing').textContent = `$${(data.totalBilling || 0).toLocaleString()}`;
            
            this.updateCharts(data.chartData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.loadDefaultDashboard();
        }
    }

    loadDefaultDashboard() {
        document.getElementById('total-employees').textContent = '3';
        document.getElementById('total-beneficiaries').textContent = '2';
        document.getElementById('total-services').textContent = '2';
        document.getElementById('total-billing').textContent = '$450';
        
        this.updateCharts({
            serviceUsage: [65, 78, 85, 92, 88, 95, 102, 88, 96, 78, 85, 92],
            coverageDistribution: [1, 1, 1]
        });
    }

    initializeCharts() {
        // Add check for canvas elements
        const serviceCanvas = document.getElementById('serviceChart');
        const coverageCanvas = document.getElementById('coverageChart');
        
        if (!serviceCanvas || !coverageCanvas) {
            console.error('Chart canvas elements not found');
            return;
        }

        // Service Usage Chart
        const serviceCtx = serviceCanvas.getContext('2d');
        this.charts.serviceChart = new Chart(serviceCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Services Used',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

        // Coverage Distribution Chart
        const coverageCtx = coverageCanvas.getContext('2d');
        this.charts.coverageChart = new Chart(coverageCtx, {
            type: 'doughnut',
            data: {
                labels: ['Basic', 'Premium', 'Family'],
                datasets: [{
                    data: [1, 1, 1],
                    backgroundColor: ['#3498db', '#e74c3c', '#27ae60'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts(data) {
        if (data && data.serviceUsage) {
            this.charts.serviceChart.data.datasets[0].data = data.serviceUsage;
            this.charts.serviceChart.update();
        }
        
        if (data && data.coverageDistribution) {
            this.charts.coverageChart.data.datasets[0].data = data.coverageDistribution;
            this.charts.coverageChart.update();
        }
    }

    async loadEmployees() {
        try {
            const response = await fetch(`${this.apiUrl}/employees`);
            const employees = await response.json();
            this.data.employees = employees;
            this.renderEmployeesTable(employees);
        } catch (error) {
            console.error('Error loading employees:', error);
            this.renderEmployeesTable(this.getSampleEmployees());
        }
    }

    renderEmployeesTable(employees) {
        const tbody = document.getElementById('employees-tbody');
        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.employeeId}</td>
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td>${emp.coveragePlan}</td>
                <td><span class="status-badge status-${emp.status.toLowerCase()}">${emp.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="app.viewEmployee('${emp._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="app.editEmployee('${emp._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteEmployee('${emp._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadBeneficiaries() {
        try {
            const response = await fetch(`${this.apiUrl}/beneficiaries`);
            const beneficiaries = await response.json();
            this.data.beneficiaries = beneficiaries;
            this.renderBeneficiariesTable(beneficiaries);
        } catch (error) {
            console.error('Error loading beneficiaries:', error);
            this.renderBeneficiariesTable(this.getSampleBeneficiaries());
        }
    }

    renderBeneficiariesTable(beneficiaries) {
        const tbody = document.getElementById('beneficiaries-tbody');
        tbody.innerHTML = beneficiaries.map(ben => `
            <tr>
                <td>${ben.beneficiaryId}</td>
                <td>${ben.firstName} ${ben.lastName}</td>
                <td>${ben.relationship}</td>
                <td>${ben.employeeName || 'N/A'}</td>
                <td>${ben.coverage}</td>
                <td><span class="status-badge status-${ben.status.toLowerCase()}">${ben.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="app.viewBeneficiary('${ben._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="app.editBeneficiary('${ben._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteBeneficiary('${ben._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadServices() {
        try {
            const response = await fetch(`${this.apiUrl}/services`);
            const services = await response.json();
            this.data.services = services;
            this.renderServicesTable(services);
        } catch (error) {
            console.error('Error loading services:', error);
            this.renderServicesTable(this.getSampleServices());
        }
    }

    renderServicesTable(services) {
        const tbody = document.getElementById('services-tbody');
        tbody.innerHTML = services.map(service => `
            <tr>
                <td>${service.serviceId}</td>
                <td>${new Date(service.date).toLocaleDateString()}</td>
                <td>${service.patientName}</td>
                <td>${service.serviceType}</td>
                <td>${service.provider}</td>
                <td>$${service.cost.toLocaleString()}</td>
                <td><span class="status-badge status-${service.status.toLowerCase()}">${service.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="app.viewService('${service._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="app.editService('${service._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteService('${service._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadBilling() {
        try {
            const response = await fetch(`${this.apiUrl}/billing`);
            const billing = await response.json();
            this.data.billing = billing;
            this.renderBillingTable(billing);
            this.updateBillingSummary(billing);
        } catch (error) {
            console.error('Error loading billing:', error);
            const sampleBilling = this.getSampleBilling();
            this.renderBillingTable(sampleBilling);
            this.updateBillingSummary(sampleBilling);
        }
    }

    renderBillingTable(billing) {
        const tbody = document.getElementById('billing-tbody');
        tbody.innerHTML = billing.map(bill => `
            <tr>
                <td>${bill.claimId}</td>
                <td>${new Date(bill.serviceDate).toLocaleDateString()}</td>
                <td>${bill.patientName}</td>
                <td>${bill.service}</td>
                <td>$${bill.amount.toLocaleString()}</td>
                <td>${bill.coverage}%</td>
                <td><span class="status-badge status-${bill.status.toLowerCase()}">${bill.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="app.viewBill('${bill._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="app.editBill('${bill._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateBillingSummary(billing) {
        const pending = billing.filter(b => b.status === 'Pending').length;
        const processed = billing.filter(b => b.status === 'Processed').length;
        const total = billing.reduce((sum, b) => sum + b.amount, 0);

        document.getElementById('pending-claims').textContent = pending;
        document.getElementById('processed-claims').textContent = processed;
        document.getElementById('total-amount').textContent = `$${total.toLocaleString()}`;
    }

    async loadPolicies() {
        try {
            const response = await fetch(`${this.apiUrl}/policies`);
            const policies = await response.json();
            this.data.policies = policies;
        } catch (error) {
            console.error('Error loading policies:', error);
        }
    }

    // Modal functions
    openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-overlay').classList.add('active');
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }

    // Employee functions
    openEmployeeModal(employee = null) {
        const isEdit = employee !== null;
        const title = isEdit ? 'Edit Employee' : 'Add Employee';
        
        const content = `
            <form id="employee-form">
                <div class="form-group">
                    <label for="emp-id">Employee ID</label>
                    <input type="text" id="emp-id" value="${employee?.employeeId || ''}" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="form-group">
                    <label for="emp-first-name">First Name</label>
                    <input type="text" id="emp-first-name" value="${employee?.firstName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="emp-last-name">Last Name</label>
                    <input type="text" id="emp-last-name" value="${employee?.lastName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="emp-department">Department</label>
                    <input type="text" id="emp-department" value="${employee?.department || ''}" required>
                </div>
                <div class="form-group">
                    <label for="emp-position">Position</label>
                    <input type="text" id="emp-position" value="${employee?.position || ''}" required>
                </div>
                <div class="form-group">
                    <label for="emp-coverage">Coverage Plan</label>
                    <select id="emp-coverage" required>
                        <option value="">Select Plan</option>
                        <option value="Basic" ${employee?.coveragePlan === 'Basic' ? 'selected' : ''}>Basic</option>
                        <option value="Premium" ${employee?.coveragePlan === 'Premium' ? 'selected' : ''}>Premium</option>
                        <option value="Family" ${employee?.coveragePlan === 'Family' ? 'selected' : ''}>Family</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="emp-status">Status</label>
                    <select id="emp-status" required>
                        <option value="Active" ${employee?.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${employee?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Add'} Employee</button>
                </div>
            </form>
        `;

        this.openModal(title, content);

        document.getElementById('employee-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmployee(employee?._id);
        });
    }

    async saveEmployee(id = null) {
        const formData = {
            employeeId: document.getElementById('emp-id').value,
            firstName: document.getElementById('emp-first-name').value,
            lastName: document.getElementById('emp-last-name').value,
            department: document.getElementById('emp-department').value,
            position: document.getElementById('emp-position').value,
            coveragePlan: document.getElementById('emp-coverage').value,
            status: document.getElementById('emp-status').value
        };

        try {
            const url = id ? `${this.apiUrl}/employees/${id}` : `${this.apiUrl}/employees`;
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.closeModal();
                this.loadEmployees();
                this.showSuccess(`Employee ${id ? 'updated' : 'added'} successfully`);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save employee');
            }
        } catch (error) {
            this.showError('Error saving employee: ' + error.message);
        }
    }

    async viewEmployee(id) {
        try {
            const response = await fetch(`${this.apiUrl}/employees/${id}`);
            const employee = await response.json();
            
            const content = `
                <div class="employee-details">
                    <h4>Employee Details</h4>
                    <p><strong>ID:</strong> ${employee.employeeId}</p>
                    <p><strong>Name:</strong> ${employee.firstName} ${employee.lastName}</p>
                    <p><strong>Department:</strong> ${employee.department}</p>
                    <p><strong>Position:</strong> ${employee.position}</p>
                    <p><strong>Coverage Plan:</strong> ${employee.coveragePlan}</p>
                    <p><strong>Status:</strong> ${employee.status}</p>
                    <p><strong>Created:</strong> ${new Date(employee.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Close</button>
                    <button type="button" class="btn-primary" onclick="app.editEmployee('${employee._id}')">Edit</button>
                </div>
            `;
            
            this.openModal('Employee Details', content);
        } catch (error) {
            this.showError('Error loading employee details: ' + error.message);
        }
    }

    async editEmployee(id) {
        try {
            const response = await fetch(`${this.apiUrl}/employees/${id}`);
            const employee = await response.json();
            this.openEmployeeModal(employee);
        } catch (error) {
            this.showError('Error loading employee: ' + error.message);
        }
    }

    async deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await fetch(`${this.apiUrl}/employees/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.loadEmployees();
                    this.showSuccess('Employee deleted successfully');
                } else {
                    throw new Error('Failed to delete employee');
                }
            } catch (error) {
                this.showError('Error deleting employee: ' + error.message);
            }
        }
    }

    // Beneficiary functions
    async openBeneficiaryModal(beneficiary = null) {
        const isEdit = beneficiary !== null;
        const title = isEdit ? 'Edit Beneficiary' : 'Add Beneficiary';
        
        // Load employees for dropdown
        let employees = [];
        try {
            const response = await fetch(`${this.apiUrl}/employees`);
            employees = await response.json();
        } catch (error) {
            console.error('Error loading employees:', error);
        }
        
        const content = `
            <form id="beneficiary-form">
                <div class="form-group">
                    <label for="ben-id">Beneficiary ID</label>
                    <input type="text" id="ben-id" value="${beneficiary?.beneficiaryId || ''}" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="form-group">
                    <label for="ben-first-name">First Name</label>
                    <input type="text" id="ben-first-name" value="${beneficiary?.firstName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="ben-last-name">Last Name</label>
                    <input type="text" id="ben-last-name" value="${beneficiary?.lastName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="ben-relationship">Relationship</label>
                    <select id="ben-relationship" required>
                        <option value="">Select Relationship</option>
                        <option value="spouse" ${beneficiary?.relationship === 'spouse' ? 'selected' : ''}>Spouse</option>
                        <option value="child" ${beneficiary?.relationship === 'child' ? 'selected' : ''}>Child</option>
                        <option value="parent" ${beneficiary?.relationship === 'parent' ? 'selected' : ''}>Parent</option>
                        <option value="other" ${beneficiary?.relationship === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ben-employee">Employee</label>
                    <select id="ben-employee" required>
                        <option value="">Select Employee</option>
                        ${employees.map(emp => `
                            <option value="${emp._id}" ${beneficiary?.employeeId === emp._id ? 'selected' : ''}>
                                ${emp.firstName} ${emp.lastName} (${emp.employeeId})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="ben-coverage">Coverage</label>
                    <select id="ben-coverage" required>
                        <option value="">Select Coverage</option>
                        <option value="Basic" ${beneficiary?.coverage === 'Basic' ? 'selected' : ''}>Basic</option>
                        <option value="Premium" ${beneficiary?.coverage === 'Premium' ? 'selected' : ''}>Premium</option>
                        <option value="Family" ${beneficiary?.coverage === 'Family' ? 'selected' : ''}>Family</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ben-status">Status</label>
                    <select id="ben-status" required>
                        <option value="Active" ${beneficiary?.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${beneficiary?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Add'} Beneficiary</button>
                </div>
            </form>
        `;

        this.openModal(title, content);

        document.getElementById('beneficiary-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBeneficiary(beneficiary?._id);
        });
    }

    async saveBeneficiary(id = null) {
        const formData = {
            beneficiaryId: document.getElementById('ben-id').value,
            firstName: document.getElementById('ben-first-name').value,
            lastName: document.getElementById('ben-last-name').value,
            relationship: document.getElementById('ben-relationship').value,
            employeeId: document.getElementById('ben-employee').value,
            coverage: document.getElementById('ben-coverage').value,
            status: document.getElementById('ben-status').value
        };

        try {
            const url = id ? `${this.apiUrl}/beneficiaries/${id}` : `${this.apiUrl}/beneficiaries`;
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.closeModal();
                this.loadBeneficiaries();
                this.showSuccess(`Beneficiary ${id ? 'updated' : 'added'} successfully`);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save beneficiary');
            }
        } catch (error) {
            this.showError('Error saving beneficiary: ' + error.message);
        }
    }

    async viewBeneficiary(id) {
        // Implementation similar to viewEmployee
        this.showError('View beneficiary feature coming soon');
    }

    async editBeneficiary(id) {
        try {
            const response = await fetch(`${this.apiUrl}/beneficiaries/${id}`);
            const beneficiary = await response.json();
            this.openBeneficiaryModal(beneficiary);
        } catch (error) {
            this.showError('Error loading beneficiary: ' + error.message);
        }
    }

    async deleteBeneficiary(id) {
        if (confirm('Are you sure you want to delete this beneficiary?')) {
            try {
                const response = await fetch(`${this.apiUrl}/beneficiaries/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.loadBeneficiaries();
                    this.showSuccess('Beneficiary deleted successfully');
                } else {
                    throw new Error('Failed to delete beneficiary');
                }
            } catch (error) {
                this.showError('Error deleting beneficiary: ' + error.message);
            }
        }
    }

    // Service functions
    openServiceModal(service = null) {
        const isEdit = service !== null;
        const title = isEdit ? 'Edit Service' : 'Add Service';
        
        const content = `
            <form id="service-form">
                <div class="form-group">
                    <label for="service-id">Service ID</label>
                    <input type="text" id="service-id" value="${service?.serviceId || ''}" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="form-group">
                    <label for="service-date">Date</label>
                    <input type="date" id="service-date" value="${service?.date ? new Date(service.date).toISOString().split('T')[0] : ''}" required>
                </div>
                <div class="form-group">
                    <label for="service-patient">Patient Name</label>
                    <input type="text" id="service-patient" value="${service?.patientName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="service-type">Service Type</label>
                    <select id="service-type" required>
                        <option value="">Select Type</option>
                        <option value="Consultation" ${service?.serviceType === 'Consultation' ? 'selected' : ''}>Consultation</option>
                        <option value="Diagnostic" ${service?.serviceType === 'Diagnostic' ? 'selected' : ''}>Diagnostic</option>
                        <option value="Treatment" ${service?.serviceType === 'Treatment' ? 'selected' : ''}>Treatment</option>
                        <option value="Surgery" ${service?.serviceType === 'Surgery' ? 'selected' : ''}>Surgery</option>
                        <option value="Emergency" ${service?.serviceType === 'Emergency' ? 'selected' : ''}>Emergency</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="service-provider">Provider</label>
                    <input type="text" id="service-provider" value="${service?.provider || ''}" required>
                </div>
                <div class="form-group">
                    <label for="service-cost">Cost</label>
                    <input type="number" id="service-cost" value="${service?.cost || ''}" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="service-status">Status</label>
                    <select id="service-status" required>
                        <option value="Pending" ${service?.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processed" ${service?.status === 'Processed' ? 'selected' : ''}>Processed</option>
                        <option value="Completed" ${service?.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Add'} Service</button>
                </div>
            </form>
        `;

        this.openModal(title, content);

        document.getElementById('service-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveService(service?._id);
        });
    }

    async saveService(id = null) {
        const formData = {
            serviceId: document.getElementById('service-id').value,
            date: document.getElementById('service-date').value,
            patientName: document.getElementById('service-patient').value,
            serviceType: document.getElementById('service-type').value,
            provider: document.getElementById('service-provider').value,
            cost: parseFloat(document.getElementById('service-cost').value),
            status: document.getElementById('service-status').value
        };

        try {
            const url = id ? `${this.apiUrl}/services/${id}` : `${this.apiUrl}/services`;
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.closeModal();
                this.loadServices();
                this.showSuccess(`Service ${id ? 'updated' : 'added'} successfully`);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save service');
            }
        } catch (error) {
            this.showError('Error saving service: ' + error.message);
        }
    }

    async viewService(id) {
        try {
            const response = await fetch(`${this.apiUrl}/services/${id}`);
            const service = await response.json();
            
            const content = `
                <div class="service-details">
                    <h4>Service Details</h4>
                    <p><strong>ID:</strong> ${service.serviceId}</p>
                    <p><strong>Date:</strong> ${new Date(service.date).toLocaleDateString()}</p>
                    <p><strong>Patient:</strong> ${service.patientName}</p>
                    <p><strong>Type:</strong> ${service.serviceType}</p>
                    <p><strong>Provider:</strong> ${service.provider}</p>
                    <p><strong>Cost:</strong> ${service.cost.toLocaleString()}</p>
                    <p><strong>Status:</strong> ${service.status}</p>
                    <p><strong>Created:</strong> ${new Date(service.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Close</button>
                    <button type="button" class="btn-primary" onclick="app.editService('${service._id}')">Edit</button>
                </div>
            `;
            
            this.openModal('Service Details', content);
        } catch (error) {
            this.showError('Error loading service details: ' + error.message);
        }
    }

    async editService(id) {
        try {
            const response = await fetch(`${this.apiUrl}/services/${id}`);
            const service = await response.json();
            this.openServiceModal(service);
        } catch (error) {
            this.showError('Error loading service: ' + error.message);
        }
    }

    async deleteService(id) {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                const response = await fetch(`${this.apiUrl}/services/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.loadServices();
                    this.showSuccess('Service deleted successfully');
                } else {
                    throw new Error('Failed to delete service');
                }
            } catch (error) {
                this.showError('Error deleting service: ' + error.message);
            }
        }
    }

    // Billing functions
    async viewBill(id) {
        try {
            const response = await fetch(`${this.apiUrl}/billing/${id}`);
            const bill = await response.json();
            
            const content = `
                <div class="billing-details">
                    <h4>Billing Details</h4>
                    <p><strong>Claim ID:</strong> ${bill.claimId}</p>
                    <p><strong>Service Date:</strong> ${new Date(bill.serviceDate).toLocaleDateString()}</p>
                    <p><strong>Patient:</strong> ${bill.patientName}</p>
                    <p><strong>Service:</strong> ${bill.service}</p>
                    <p><strong>Amount:</strong> ${bill.amount.toLocaleString()}</p>
                    <p><strong>Coverage:</strong> ${bill.coverage}%</p>
                    <p><strong>Covered Amount:</strong> ${(bill.amount * bill.coverage / 100).toFixed(2)}</p>
                    <p><strong>Patient Responsibility:</strong> ${(bill.amount * (100 - bill.coverage) / 100).toFixed(2)}</p>
                    <p><strong>Status:</strong> ${bill.status}</p>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Close</button>
                    <button type="button" class="btn-primary" onclick="app.editBill('${bill._id}')">Edit</button>
                </div>
            `;
            
            this.openModal('Billing Details', content);
        } catch (error) {
            this.showError('Error loading billing details: ' + error.message);
        }
    }

    async editBill(id) {
        try {
            const response = await fetch(`${this.apiUrl}/billing/${id}`);
            const bill = await response.json();
            
            const content = `
                <form id="billing-form">
                    <div class="form-group">
                        <label for="bill-status">Status</label>
                        <select id="bill-status" required>
                            <option value="Pending" ${bill.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Processed" ${bill.status === 'Processed' ? 'selected' : ''}>Processed</option>
                            <option value="Approved" ${bill.status === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Rejected" ${bill.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="bill-coverage">Coverage Percentage</label>
                        <input type="number" id="bill-coverage" value="${bill.coverage}" min="0" max="100" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Update Billing</button>
                    </div>
                </form>
            `;
            
            this.openModal('Edit Billing', content);
            
            document.getElementById('billing-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const updateData = {
                    status: document.getElementById('bill-status').value,
                    coverage: parseInt(document.getElementById('bill-coverage').value)
                };
                
                try {
                    const response = await fetch(`${this.apiUrl}/billing/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                    });
                    
                    if (response.ok) {
                        this.closeModal();
                        this.loadBilling();
                        this.showSuccess('Billing updated successfully');
                    } else {
                        throw new Error('Failed to update billing');
                    }
                } catch (error) {
                    this.showError('Error updating billing: ' + error.message);
                }
            });
        } catch (error) {
            this.showError('Error loading billing: ' + error.message);
        }
    }

    // Policy functions
    openPolicyModal() {
        const content = `
            <form id="policy-form">
                <div class="form-group">
                    <label for="policy-name">Policy Name</label>
                    <input type="text" id="policy-name" required>
                </div>
                <div class="form-group">
                    <label for="policy-limit">Annual Limit</label>
                    <input type="number" id="policy-limit" min="0" step="1000" required>
                </div>
                <div class="form-group">
                    <label for="policy-deductible">Deductible</label>
                    <input type="number" id="policy-deductible" min="0" step="50" required>
                </div>
                <div class="form-group">
                    <label for="policy-coverage">Coverage Percentage</label>
                    <input type="number" id="policy-coverage" min="0" max="100" required>
                </div>
                <div class="form-group">
                    <label for="policy-status">Status</label>
                    <select id="policy-status" required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Policy</button>
                </div>
            </form>
        `;

        this.openModal('Add Policy', content);

        document.getElementById('policy-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                policyName: document.getElementById('policy-name').value,
                annualLimit: parseInt(document.getElementById('policy-limit').value),
                deductible: parseInt(document.getElementById('policy-deductible').value),
                coverage: parseInt(document.getElementById('policy-coverage').value),
                status: document.getElementById('policy-status').value
            };

            try {
                const response = await fetch(`${this.apiUrl}/policies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    this.closeModal();
                    this.loadPolicies();
                    this.showSuccess('Policy added successfully');
                    location.reload(); // Reload to show new policy
                } else {
                    throw new Error('Failed to add policy');
                }
            } catch (error) {
                this.showError('Error adding policy: ' + error.message);
            }
        });
    }

    editPolicy(policyType) {
        this.showError('Edit policy feature coming soon');
    }

    // Report generation
    async generateBillReport() {
        const content = `
            <form id="report-form">
                <h4>Generate Billing Report</h4>
                <div class="form-group">
                    <label for="report-start">Start Date</label>
                    <input type="date" id="report-start" required>
                </div>
                <div class="form-group">
                    <label for="report-end">End Date</label>
                    <input type="date" id="report-end" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Generate Report</button>
                </div>
            </form>
        `;

        this.openModal('Generate Report', content);

        document.getElementById('report-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const startDate = document.getElementById('report-start').value;
            const endDate = document.getElementById('report-end').value;
            
            try {
                const response = await fetch(`${this.apiUrl}/reports/billing?start_date=${startDate}&end_date=${endDate}`);
                const report = await response.json();
                
                // Display report summary
                const reportContent = `
                    <div class="report-summary">
                        <h4>Billing Report Summary</h4>
                        <p><strong>Period:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
                        <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
                        
                        <h5>Summary by Status:</h5>
                        ${report.summary.map(item => `
                            <p><strong>${item._id}:</strong> ${item.count} claims, Total: ${item.totalAmount.toLocaleString()}</p>
                        `).join('')}
                        
                        <h5>Total Records:</h5>
                        <p>${report.detailedRecords.length} billing records found</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="app.closeModal()">Close</button>
                        <button type="button" class="btn-primary" onclick="app.downloadReport()">Download Full Report</button>
                    </div>
                `;
                
                this.openModal('Billing Report', reportContent);
                this.currentReport = report;
            } catch (error) {
                this.showError('Error generating report: ' + error.message);
            }
        });
    }

    downloadReport() {
        if (!this.currentReport) return;
        
        // Convert report to CSV format
        const csv = this.convertToCSV(this.currentReport.detailedRecords);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Search and filter functions
    searchEmployees() {
        const searchTerm = document.getElementById('employee-search').value.toLowerCase();
        const filteredEmployees = this.data.employees.filter(emp => 
            emp.firstName.toLowerCase().includes(searchTerm) ||
            emp.lastName.toLowerCase().includes(searchTerm) ||
            emp.employeeId.toLowerCase().includes(searchTerm) ||
            emp.department.toLowerCase().includes(searchTerm)
        );
        this.renderEmployeesTable(filteredEmployees);
    }

    searchBeneficiaries() {
        const searchTerm = document.getElementById('beneficiary-search').value.toLowerCase();
        const filteredBeneficiaries = this.data.beneficiaries.filter(ben => 
            ben.firstName.toLowerCase().includes(searchTerm) ||
            ben.lastName.toLowerCase().includes(searchTerm) ||
            ben.beneficiaryId.toLowerCase().includes(searchTerm) ||
            (ben.employeeName && ben.employeeName.toLowerCase().includes(searchTerm))
        );
        this.renderBeneficiariesTable(filteredBeneficiaries);
    }

    searchServices() {
        const searchTerm = document.getElementById('service-search').value.toLowerCase();
        const filteredServices = this.data.services.filter(service => 
            service.serviceId.toLowerCase().includes(searchTerm) ||
            service.patientName.toLowerCase().includes(searchTerm) ||
            service.serviceType.toLowerCase().includes(searchTerm) ||
            service.provider.toLowerCase().includes(searchTerm)
        );
        this.renderServicesTable(filteredServices);
    }

    filterBeneficiaries() {
        const filterValue = document.getElementById('beneficiary-filter').value;
        const searchTerm = document.getElementById('beneficiary-search').value.toLowerCase();
        
        let filteredBeneficiaries = this.data.beneficiaries;
        
        if (filterValue !== 'all') {
            filteredBeneficiaries = filteredBeneficiaries.filter(ben => 
                ben.relationship.toLowerCase() === filterValue
            );
        }
        
        if (searchTerm) {
            filteredBeneficiaries = filteredBeneficiaries.filter(ben => 
                ben.firstName.toLowerCase().includes(searchTerm) ||
                ben.lastName.toLowerCase().includes(searchTerm) ||
                ben.beneficiaryId.toLowerCase().includes(searchTerm) ||
                (ben.employeeName && ben.employeeName.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderBeneficiariesTable(filteredBeneficiaries);
    }

    filterServices() {
        const typeFilter = document.getElementById('service-type-filter').value;
        const dateFilter = document.getElementById('service-date-filter').value;
        const searchTerm = document.getElementById('service-search').value.toLowerCase();
        
        let filteredServices = this.data.services;
        
        if (typeFilter !== 'all') {
            filteredServices = filteredServices.filter(service => 
                service.serviceType.toLowerCase() === typeFilter.toLowerCase()
            );
        }
        
        if (dateFilter) {
            filteredServices = filteredServices.filter(service => {
                const serviceDate = new Date(service.date).toISOString().split('T')[0];
                return serviceDate === dateFilter;
            });
        }
        
        if (searchTerm) {
            filteredServices = filteredServices.filter(service => 
                service.serviceId.toLowerCase().includes(searchTerm) ||
                service.patientName.toLowerCase().includes(searchTerm) ||
                service.serviceType.toLowerCase().includes(searchTerm) ||
                service.provider.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderServicesTable(filteredServices);
    }

    // Utility functions
    showLoading() {
        document.getElementById('loading-spinner').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-spinner').classList.remove('active');
    }

    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }

    // Sample data generators (fallback for when API is not available)
    getSampleEmployees() {
        return [
            {
                _id: '1',
                employeeId: 'EMP001',
                firstName: 'John',
                lastName: 'Doe',
                department: 'IT',
                position: 'Software Engineer',
                coveragePlan: 'Premium',
                status: 'Active',
                createdAt: new Date()
            },
            {
                _id: '2',
                employeeId: 'EMP002',
                firstName: 'Jane',
                lastName: 'Smith',
                department: 'HR',
                position: 'HR Manager',
                coveragePlan: 'Family',
                status: 'Active',
                createdAt: new Date()
            },
            {
                _id: '3',
                employeeId: 'EMP003',
                firstName: 'Mike',
                lastName: 'Johnson',
                department: 'Finance',
                position: 'Accountant',
                coveragePlan: 'Basic',
                status: 'Active',
                createdAt: new Date()
            }
        ];
    }

    getSampleBeneficiaries() {
        return [
            {
                _id: '1',
                beneficiaryId: 'BEN001',
                firstName: 'Sarah',
                lastName: 'Doe',
                relationship: 'spouse',
                employeeName: 'John Doe',
                coverage: 'Premium',
                status: 'Active'
            },
            {
                _id: '2',
                beneficiaryId: 'BEN002',
                firstName: 'Tom',
                lastName: 'Smith',
                relationship: 'child',
                employeeName: 'Jane Smith',
                coverage: 'Family',
                status: 'Active'
            }
        ];
    }

    getSampleServices() {
        return [
            {
                _id: '1',
                serviceId: 'SRV001',
                date: new Date().toISOString(),
                patientName: 'John Doe',
                serviceType: 'Consultation',
                provider: 'City Hospital',
                cost: 150,
                status: 'Processed',
                createdAt: new Date()
            },
            {
                _id: '2',
                serviceId: 'SRV002',
                date: new Date().toISOString(),
                patientName: 'Sarah Doe',
                serviceType: 'Diagnostic',
                provider: 'Med Lab',
                cost: 300,
                status: 'Pending',
                createdAt: new Date()
            }
        ];
    }

    getSampleBilling() {
        return [
            {
                _id: '1',
                claimId: 'CLM001',
                serviceDate: new Date().toISOString(),
                patientName: 'John Doe',
                service: 'Consultation',
                amount: 150,
                coverage: 80,
                status: 'Processed'
            },
            {
                _id: '2',
                claimId: 'CLM002',
                serviceDate: new Date().toISOString(),
                patientName: 'Sarah Doe',
                service: 'Diagnostic',
                amount: 300,
                coverage: 90,
                status: 'Pending'
            }
        ];
    }
}

// Global functions for onclick handlers
window.refreshDashboard = function() {
    app.loadDashboard();
};

window.openEmployeeModal = function() {
    app.openEmployeeModal();
};

window.openBeneficiaryModal = function() {
    app.openBeneficiaryModal();
};

window.openServiceModal = function() {
    app.openServiceModal();
};

window.openPolicyModal = function() {
    app.openPolicyModal();
};

window.generateBillReport = function() {
    app.generateBillReport();
};

window.editPolicy = function(policyType) {
    app.editPolicy(policyType);
};

// Initialize the application after DOM is ready
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new MedicalCoverageSystem();
});

// Add CSS for toast notifications
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--white);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 3000;
}

.toast.show {
    transform: translateX(0);
}

.toast.success {
    border-left: 4px solid var(--success-color);
}

.toast.success i {
    color: var(--success-color);
}

.toast.error {
    border-left: 4px solid var(--accent-color);
}

.toast.error i {
    color: var(--accent-color);
}

.employee-details, .service-details, .billing-details, .report-summary {
    padding: 1rem;
}

.employee-details p, .service-details p, .billing-details p {
    margin-bottom: 0.5rem;
}

.employee-details h4, .service-details h4, .billing-details h4, .report-summary h4 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.report-summary h5 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

/* Fix for chart containers */
#serviceChart, #coverageChart {
    max-height: 300px;
    height: 300px !important;
}

.chart-container {
    position: relative;
    height: 350px;
}
`;
document.head.appendChild(toastStyles);