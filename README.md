# Employee Medical Coverage System 🏥

A comprehensive web-based system for managing employee medical coverage, beneficiaries, healthcare services, and billing claims.

![Medical Coverage System](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.7+-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-4.4+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **👥 Employee Management**: Complete CRUD operations for employee records with coverage plans
- **👨‍👩‍👧‍👦 Beneficiary Management**: Manage employee family members and dependents
- **🏥 Medical Services**: Track and record medical services provided
- **💰 Billing & Claims**: Process insurance claims with automatic coverage calculations
- **📊 Dashboard Analytics**: Real-time statistics with interactive charts
- **📄 Policy Management**: Configure and manage coverage policies
- **📑 Report Generation**: Generate and export billing reports in CSV format

### Additional Features
- 🔍 Advanced search and filtering across all modules
- 📱 Responsive design for desktop, tablet, and mobile
- 🔔 Real-time toast notifications for user feedback
- 📈 Interactive charts using Chart.js
- 🗄️ MongoDB Atlas cloud database integration
- 🔒 RESTful API with proper error handling

### Test Credentials
The system comes with pre-populated sample data:
- Employee IDs: EMP001, EMP002, EMP003
- Beneficiary IDs: BEN001, BEN002
- Service IDs: SRV001, SRV002

## 🛠️ Technologies

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Vanilla JS with no framework dependencies
- **Chart.js** - Interactive data visualization
- **Font Awesome** - Icon library

### Backend
- **Python 3.7+** - Server-side language
- **Flask** - Lightweight web framework
- **Flask-CORS** - Cross-origin resource sharing
- **PyMongo** - MongoDB driver for Python

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Aggregation Pipelines** - Complex data queries
- **Indexes** - Performance optimization

## 🏗️ Architecture

```
medical-coverage-system/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # All styling
│   └── script.js           # Frontend logic
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
└── README.md               # Documentation
```

### System Architecture
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Flask API  │────▶│ MongoDB Atlas│
│ (HTML/JS)   │◀────│   (Python)  │◀────│   (Cloud)    │
└─────────────┘     └─────────────┘     └──────────────┘
```

## 📥 Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for MongoDB Atlas)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/medical-coverage-system.git
cd medical-coverage-system
```

### Step 2: Set Up Python Environment
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure MongoDB Connection
The system uses MongoDB Atlas. The connection string is already configured in `app.py`:
```python
MONGO_URI = "mongodb://pls2:446655@ac-gusox2x-shard-00-00.cuirnxq.mongodb.net:27017..."
```

> **Note**: For production use, move credentials to environment variables.

### Step 4: Run the Application
```bash
# Start the Flask server
python app.py

# The server will start on http://localhost:5000
```

### Step 5: Access the Application
Open your web browser and navigate to:
```
file:///path/to/medical-coverage-system/index.html
```
Or use a local server like Live Server in VS Code.

## ⚙️ Configuration

### Environment Variables (Recommended for Production)
Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
FLASK_ENV=production
SECRET_KEY=your_secret_key
PORT=5000
```

### API Configuration
Update the API URL in `script.js` if needed:
```javascript
this.apiUrl = 'http://localhost:5000/api';
```

## 📖 Usage

### Dashboard
The dashboard provides an overview of:
- Total employees, beneficiaries, services, and billing
- Monthly service usage trends
- Coverage distribution charts

### Managing Employees
1. Navigate to the **Employees** section
2. Click **Add Employee** to register a new employee
3. Fill in required fields (ID, name, department, coverage plan)
4. Use the action buttons to view, edit, or delete records

### Managing Beneficiaries
1. Navigate to the **Beneficiaries** section
2. Click **Add Beneficiary** to add family members
3. Select the associated employee and relationship
4. Manage coverage status and details

### Recording Medical Services
1. Go to the **Services** section
2. Click **Record Service** to add a new medical service
3. Enter service details, provider, and cost
4. Track service status (Pending, Processed, Completed)

### Processing Claims
1. Navigate to **Billing**
2. View pending and processed claims
3. Edit claim status and coverage percentages
4. Generate billing reports for specific date ranges

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Dashboard
- `GET /dashboard` - Get dashboard statistics and chart data

#### Employees
- `GET /employees` - Get all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get employee by ID
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

#### Beneficiaries
- `GET /beneficiaries` - Get all beneficiaries with employee info
- `POST /beneficiaries` - Create new beneficiary
- `PUT /beneficiaries/:id` - Update beneficiary
- `DELETE /beneficiaries/:id` - Delete beneficiary

#### Services
- `GET /services` - Get all medical services
- `POST /services` - Create new service
- `GET /services/:id` - Get service by ID
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

#### Billing
- `GET /billing` - Get all billing records
- `POST /billing` - Create new billing record
- `GET /billing/:id` - Get billing record by ID
- `PUT /billing/:id` - Update billing record
- `DELETE /billing/:id` - Delete billing record

#### Policies
- `GET /policies` - Get all policies
- `POST /policies` - Create new policy
- `PUT /policies/:id` - Update policy

#### Reports
- `GET /reports/billing?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Generate billing report

### Example API Calls

#### Create Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP004",
    "firstName": "Alice",
    "lastName": "Johnson",
    "department": "Marketing",
    "position": "Manager",
    "coveragePlan": "Premium",
    "status": "Active"
  }'
```

#### Get Dashboard Data
```bash
curl http://localhost:5000/api/dashboard
```

## 🗄️ Database Schema

### Collections

#### employees
```javascript
{
  "_id": ObjectId,
  "employeeId": String,
  "firstName": String,
  "lastName": String,
  "department": String,
  "position": String,
  "coveragePlan": String, // "Basic", "Premium", "Family"
  "status": String, // "Active", "Inactive"
  "createdAt": Date,
  "updatedAt": Date
}
```

#### beneficiaries
```javascript
{
  "_id": ObjectId,
  "beneficiaryId": String,
  "firstName": String,
  "lastName": String,
  "relationship": String, // "spouse", "child", "parent", "other"
  "employeeId": String, // Reference to employee._id
  "coverage": String, // "Basic", "Premium", "Family"
  "status": String, // "Active", "Inactive"
  "createdAt": Date,
  "updatedAt": Date
}
```

#### services
```javascript
{
  "_id": ObjectId,
  "serviceId": String,
  "date": Date,
  "patientName": String,
  "serviceType": String, // "Consultation", "Diagnostic", "Treatment", "Surgery", "Emergency"
  "provider": String,
  "cost": Number,
  "status": String, // "Pending", "Processed", "Completed"
  "createdAt": Date,
  "updatedAt": Date
}
```

#### billing
```javascript
{
  "_id": ObjectId,
  "claimId": String,
  "serviceDate": Date,
  "patientName": String,
  "service": String,
  "amount": Number,
  "coverage": Number, // Percentage (0-100)
  "status": String, // "Pending", "Processed", "Approved", "Rejected"
  "createdAt": Date,
  "updatedAt": Date
}
```

#### policies
```javascript
{
  "_id": ObjectId,
  "policyName": String,
  "annualLimit": Number,
  "deductible": Number,
  "coverage": Number, // Percentage (0-100)
  "status": String, // "Active", "Inactive"
  "createdAt": Date,
  "updatedAt": Date
}
```

## 📸 Screenshots

### Dashboard
The main dashboard showing statistics and charts for service usage and coverage distribution.

### Employee Management
CRUD interface for managing employee records with search and filter capabilities.

### Billing & Claims
Process insurance claims with automatic coverage calculations and status tracking.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow PEP 8 for Python code
- Use ESLint for JavaScript
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 🐛 Known Issues

- Chart responsiveness on very small screens
- Beneficiary lookup performance with large datasets
- Date picker compatibility on older browsers

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications for claim approvals
- [ ] Advanced reporting with PDF export
- [ ] Multi-language support
- [ ] Audit logging
- [ ] Bulk import/export functionality
- [ ] Mobile application
- [ ] Integration with external healthcare providers
- [ ] AI-powered claim predictions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for beautiful charts
- Font Awesome for icons
- MongoDB Atlas for cloud database
- Flask community for excellent documentation

## 📞 Support

For support: alsariti1@gmail.com

---

Made with ❤️ by Mohamed Alsariti

**Note**: This is a demonstration project. For production use, please implement proper security measures including authentication, authorization, input validation, and environment-based configuration.
<img width="1920" height="1080" alt="Screenshot (374)" src="https://github.com/user-attachments/assets/150cae7a-c85b-4589-a9d9-9e574733b895" />
<img width="1920" height="1080" alt="Screenshot (375)" src="https://github.com/user-attachments/assets/7e448878-9327-4a19-9364-5ca363db5d9e" />
<img width="1920" height="1080" alt="Screenshot (376)" src="https://github.com/user-attachments/assets/5520fd59-dbc3-44e9-ac4e-f1d337558ce3" />
<img width="1920" height="1080" alt="Screenshot (377)" src="https://github.com/user-attachments/assets/480f5295-0c45-4871-8442-2dee49f2cb7c" />
<img width="1920" height="1080" alt="Screenshot (379)" src="https://github.com/user-attachments/assets/a1f8521e-5b66-4a0a-bbfd-5139047caa75" />


