# Employee Medical Coverage System

A comprehensive web-based system for managing employee medical coverage, beneficiaries, healthcare contracts, medical services, and billing claims.

## Features

- **Employee Management**: Track employee information, departments, positions, and coverage plans
- **Beneficiary Management**: Manage employee family members and their coverage status
- **Healthcare Contracts**: Maintain contracts with hospitals, clinics, and other healthcare providers
- **Medical Services**: Record and track medical services provided to employees and beneficiaries
- **Billing & Claims**: Process insurance claims and track coverage payments
- **Dashboard**: Real-time statistics and recent activity monitoring
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python Flask REST API
- **Database**: MongoDB Atlas (Cloud Database)
- **Styling**: Modern CSS with gradients and animations

## File Structure

```
medical-coverage-system/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript frontend logic
├── app.py             # Python Flask backend with MongoDB
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Setup Instructions

### 1. Backend Setup (Python)

1. **Install Python** (3.7 or higher)
   ```bash
   python --version
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server**
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:8000`

### 2. Frontend Setup

1. **Open the HTML file**
   - Simply open `index.html` in your web browser
   - Or use a local server like Live Server in VS Code

2. **Configure API URL** (if needed)
   - The frontend is configured to use `http://localhost:8000/api`
   - If you change the backend port, update the `API_BASE_URL` in `script.js`

### 3. Database Configuration

The system uses **MongoDB Atlas** (cloud database) with the following features:
- **Automatic Connection**: Connects to the provided MongoDB Atlas cluster
- **SSL/TLS Security**: Secure connection with certificate validation
- **Sample Data**: Automatically populated on first run
- **Collections**: employees, beneficiaries, contracts, medical_services, billing
- **Indexes**: Created automatically for better performance

#### Database Collections:
- `employees` - Employee information and coverage plans
- `beneficiaries` - Employee family members and dependents
- `contracts` - Healthcare provider agreements
- `medical_services` - Medical treatments and services
- `billing` - Insurance claims and coverage calculations

## Usage

### Dashboard
- View system statistics (employees, beneficiaries, contracts, coverage)
- Monitor recent activities
- Get overview of system health

### Employee Management
- Add new employees with coverage plans
- Edit employee information
- Track employee status and coverage

### Beneficiary Management
- Add family members to employee coverage
- Track relationships and coverage status
- Manage beneficiary eligibility

### Healthcare Contracts
- Maintain contracts with healthcare providers
- Set coverage limits and contract periods
- Track provider types (hospitals, clinics, labs, etc.)

### Medical Services
- Record medical services provided
- Track service types, costs, and descriptions
- Link services to providers and patients

### Billing & Claims
- Process insurance claims
- Calculate coverage amounts based on percentage
- Track claim status and approvals

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/{id}` - Get employee by ID
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

### Beneficiaries
- `GET /api/beneficiaries` - Get all beneficiaries (with employee info)
- `POST /api/beneficiaries` - Create new beneficiary

### Contracts
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create new contract

### Medical Services
- `GET /api/services` - Get all medical services (with provider info)
- `POST /api/services` - Create new service

### Billing
- `GET /api/billing` - Get all billing records (with service and provider info)
- `POST /api/billing` - Create new billing record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/coverage/analysis` - Get coverage analysis

### System
- `GET /api/health` - Health check endpoint

## Sample Data

The system comes with sample data including:
- 4 employees across different departments
- Family members as beneficiaries
- Healthcare provider contracts
- Medical service records
- Processed insurance claims

## Database Features

### MongoDB Atlas Benefits:
- **Cloud-based**: No local database installation required
- **Scalable**: Automatically scales with your data
- **Secure**: Built-in security features and SSL/TLS encryption
- **Backup**: Automatic backups and point-in-time recovery
- **Global**: Deployed across multiple regions for reliability

### Data Relationships:
- Employees ↔ Beneficiaries (One-to-Many)
- Contracts ↔ Medical Services (One-to-Many)
- Medical Services ↔ Billing (One-to-Many)
- Aggregation pipelines for complex queries

## Customization

### Adding New Features
1. **Frontend**: Add new sections to HTML, style in CSS, implement logic in JavaScript
2. **Backend**: Add new endpoints in `app.py`, create new collections if needed
3. **Database**: Use MongoDB aggregation pipelines for complex queries

### Database Operations
```python
# Example: Custom aggregation pipeline
pipeline = [
    {'$match': {'status': 'Active'}},
    {'$lookup': {
        'from': 'employees',
        'localField': 'employee_id',
        'foreignField': '_id',
        'as': 'employee'
    }},
    {'$unwind': '$employee'},
    {'$group': {
        '_id': '$employee.department',
        'count': {'$sum': 1}
    }}
]
```

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The system uses CSS Grid and Flexbox for responsive design
- CSS custom properties (variables) for consistent theming

## Security Considerations

For production use, consider:
- Add authentication and authorization
- Implement HTTPS
- Add input validation and sanitization
- Use environment variables for database connection
- Implement rate limiting
- Add audit logging
- Use MongoDB Atlas security features (IP whitelisting, VPC peering)

## Development

### Running in Development Mode
```bash
# Backend (with auto-reload and debug mode)
python app.py

# Frontend (with live reload using VS Code Live Server)
# Right-click on index.html and select "Open with Live Server"
```

### Database Management
```python
# Reset collections (in Python console)
from pymongo import MongoClient
import certifi

client = MongoClient("your_connection_string", tlsCAFile=certifi.where())
db = client.medical_coverage_system

# Drop all collections
db.employees.drop()
db.beneficiaries.drop()
db.contracts.drop()
db.medical_services.drop()
db.billing.drop()

# Restart the server to recreate with fresh sample data
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Check internet connection
   - Verify MongoDB Atlas cluster is running
   - Ensure IP address is whitelisted in MongoDB Atlas
   - Check username/password in connection string

2. **CORS Errors**
   - Ensure Flask-CORS is installed
   - Check that the backend is running on the correct port

3. **Certificate Errors**
   - Ensure `certifi` package is installed
   - Check SSL/TLS settings in MongoDB Atlas

4. **Frontend Not Loading Data**
   - Verify API_BASE_URL in script.js
   - Check browser console for errors
   - Ensure backend server is running

5. **Port Already in Use**
   - Change the port in `app.py`: `app.run(port=8001)`
   - Update API_BASE_URL in script.js accordingly

### MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Set up database user with read/write permissions
4. Configure network access (IP whitelist)
5. Get connection string and update in `app.py`

## Performance Optimization

### Database Indexing
The system automatically creates indexes on:
- `employees.employee_id` (unique)
- `contracts.contract_id` (unique)
- `medical_services.service_id` (unique)
- `billing.claim_id` (unique)
- `beneficiaries.employee_id` (compound with name)

### Query Optimization
- Uses MongoDB aggregation pipelines for complex queries
- Implements proper data relationships
- Minimizes database round trips

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with MongoDB Atlas
5. Submit a pull request

## Usage

### Dashboard
- View system statistics (employees, beneficiaries, contracts, coverage)
- Monitor recent activities
- Get overview of system health

### Employee Management
- Add new employees with coverage plans
- Edit employee information
- Track employee status and coverage

### Beneficiary Management
- Add family members to employee coverage
- Track relationships and coverage status
- Manage beneficiary eligibility

### Healthcare Contracts
- Maintain contracts with healthcare providers
- Set coverage limits and contract periods
- Track provider types (hospitals, clinics, labs, etc.)

### Medical Services
- Record medical services provided
- Track service types, costs, and descriptions
- Link services to providers and patients

### Billing & Claims
- Process insurance claims
- Calculate coverage amounts based on percentage
- Track claim status and approvals

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/{id}` - Get employee by ID
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

### Beneficiaries
- `GET /api/beneficiaries` - Get all beneficiaries
- `POST /api/beneficiaries` - Create new beneficiary

### Contracts
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create new contract

### Medical Services
- `GET /api/services` - Get all medical services
- `POST /api/services` - Create new service

### Billing
- `GET /api/billing` - Get all billing records
- `POST /api/billing` - Create new billing record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/coverage/analysis` - Get coverage analysis

## Sample Data

The system comes with sample data including:
- 4 employees across different departments
- Family members as beneficiaries
- Healthcare provider contracts
- Medical service records
- Processed insurance claims

## Customization

### Adding New Features
1. **Frontend**: Add new sections to HTML, style in CSS, implement logic in JavaScript
2. **Backend**: Add new endpoints in `app.py`, create database tables if needed
3. **Database**: Modify table schemas in the `init_database()` function

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The system uses CSS Grid and Flexbox for responsive design
- CSS custom properties (variables) for consistent theming

### Business Logic
- Customize coverage calculations in the billing module
- Add validation rules for different employee types
- Implement complex approval workflows

## Security Considerations

For production use, consider:
- Add authentication and authorization
- Implement HTTPS
- Add input validation and sanitization
- Use environment variables for configuration
- Implement rate limiting
- Add audit logging

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Development

### Running in Development Mode
```bash
# Backend (with auto-reload)
python app.py

# Frontend (with live reload using VS Code Live Server)
# Right-click on index.html and select "Open with Live Server"
```

### Database Management
```python
# Reset database (in Python)
import os
if os.path.exists('medical_coverage.db'):
    os.remove('medical_coverage.db')

# Then restart the server to recreate with fresh sample data
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Flask-CORS is installed
   - Check that the backend is running on the correct port

2. **Database Errors**
   - Delete `medical_coverage.db` and restart the server
   - Check file permissions

3. **Frontend Not Loading Data**
   - Verify API_BASE_URL in script.js
   - Check browser console for errors
   - Ensure backend server is running

4. **Port Already in Use**
   - Change the port in `app.py`: `app.run(port=8001)`
   - Update API_BASE_URL in script.js accordingly

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit