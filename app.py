# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId  # Correct import for ObjectId
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = "mongodb://pls2:446655@ac-gusox2x-shard-00-00.cuirnxq.mongodb.net:27017,ac-gusox2x-shard-00-01.cuirnxq.mongodb.net:27017,ac-gusox2x-shard-00-02.cuirnxq.mongodb.net:27017/?replicaSet=atlas-u4zpsl-shard-0&ssl=true&authSource=admin"

try:
    client = MongoClient(MONGO_URI)
    db = client.medical_coverage_db
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Collections
employees_collection = db.employees
beneficiaries_collection = db.beneficiaries
services_collection = db.services
billing_collection = db.billing
policies_collection = db.policies

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    elif isinstance(doc, dict):
        for key, value in doc.items():
            if hasattr(value, '__class__') and value.__class__.__name__ == 'ObjectId':
                doc[key] = str(value)
            elif isinstance(value, datetime):
                doc[key] = value.isoformat()
            elif isinstance(value, (dict, list)):
                doc[key] = serialize_doc(value)
        return doc
    return doc

# Dashboard endpoint
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    try:
        # Get counts
        total_employees = employees_collection.count_documents({})
        total_beneficiaries = beneficiaries_collection.count_documents({})
        total_services = services_collection.count_documents({})
        
        # Get billing total
        billing_pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        billing_result = list(billing_collection.aggregate(billing_pipeline))
        total_billing = billing_result[0]["total"] if billing_result else 0
        
        # Get chart data
        service_usage_data = get_service_usage_data()
        coverage_distribution_data = get_coverage_distribution_data()
        
        return jsonify({
            "totalEmployees": total_employees,
            "totalBeneficiaries": total_beneficiaries,
            "totalServices": total_services,
            "totalBilling": total_billing,
            "chartData": {
                "serviceUsage": service_usage_data,
                "coverageDistribution": coverage_distribution_data
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_service_usage_data():
    # Get service usage for the last 12 months
    try:
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$date"},
                        "month": {"$month": "$date"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}},
            {"$limit": 12}
        ]
        results = list(services_collection.aggregate(pipeline))
        
        # Fill in missing months with 0
        monthly_data = [0] * 12
        for result in results:
            month_index = result["_id"]["month"] - 1
            if 0 <= month_index < 12:
                monthly_data[month_index] = result["count"]
        
        return monthly_data
    except:
        return [65, 78, 85, 92, 88, 95, 102, 88, 96, 78, 85, 92]

def get_coverage_distribution_data():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$coveragePlan",
                    "count": {"$sum": 1}
                }
            }
        ]
        results = list(employees_collection.aggregate(pipeline))
        
        # Convert to array format for chart
        coverage_data = [0, 0, 0]  # [Basic, Premium, Family]
        for result in results:
            if result["_id"] == "Basic":
                coverage_data[0] = result["count"]
            elif result["_id"] == "Premium":
                coverage_data[1] = result["count"]
            elif result["_id"] == "Family":
                coverage_data[2] = result["count"]
        
        return coverage_data
    except:
        return [65, 25, 10]

# Employee endpoints
@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        employees = list(employees_collection.find())
        return jsonify(serialize_doc(employees))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/employees', methods=['POST'])
def create_employee():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['employeeId', 'firstName', 'lastName', 'department', 'position', 'coveragePlan', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if employee ID already exists
        if employees_collection.find_one({"employeeId": data['employeeId']}):
            return jsonify({"error": "Employee ID already exists"}), 400
        
        # Add timestamps
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = employees_collection.insert_one(data)
        return jsonify({"message": "Employee created successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/employees/<employee_id>', methods=['GET'])
def get_employee(employee_id):
    try:
        employee = employees_collection.find_one({"_id": ObjectId(employee_id)})
        if not employee:
            return jsonify({"error": "Employee not found"}), 404
        return jsonify(serialize_doc(employee))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/employees/<employee_id>', methods=['PUT'])
def update_employee(employee_id):
    try:
        data = request.get_json()
        data['updatedAt'] = datetime.utcnow()
        
        result = employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Employee not found"}), 404
        
        return jsonify({"message": "Employee updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/employees/<employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    try:
        result = employees_collection.delete_one({"_id": ObjectId(employee_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Employee not found"}), 404
        
        return jsonify({"message": "Employee deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Beneficiary endpoints
@app.route('/api/beneficiaries', methods=['GET'])
def get_beneficiaries():
    try:
        # Join with employees collection to get employee names
        pipeline = [
            {
                "$addFields": {
                    "employeeObjectId": {"$toObjectId": "$employeeId"}
                }
            },
            {
                "$lookup": {
                    "from": "employees",
                    "localField": "employeeObjectId",
                    "foreignField": "_id",
                    "as": "employee"
                }
            },
            {
                "$addFields": {
                    "employeeName": {
                        "$cond": {
                            "if": {"$gt": [{"$size": "$employee"}, 0]},
                            "then": {
                                "$concat": [
                                    {"$arrayElemAt": ["$employee.firstName", 0]},
                                    " ",
                                    {"$arrayElemAt": ["$employee.lastName", 0]}
                                ]
                            },
                            "else": "Unknown"
                        }
                    }
                }
            },
            {
                "$project": {
                    "employee": 0,
                    "employeeObjectId": 0
                }
            }
        ]
        
        beneficiaries = list(beneficiaries_collection.aggregate(pipeline))
        return jsonify(serialize_doc(beneficiaries))
    except Exception as e:
        # Fallback to simple query if aggregation fails
        beneficiaries = list(beneficiaries_collection.find())
        return jsonify(serialize_doc(beneficiaries))

@app.route('/api/beneficiaries', methods=['POST'])
def create_beneficiary():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['beneficiaryId', 'firstName', 'lastName', 'relationship', 'employeeId', 'coverage', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if beneficiary ID already exists
        if beneficiaries_collection.find_one({"beneficiaryId": data['beneficiaryId']}):
            return jsonify({"error": "Beneficiary ID already exists"}), 400
        
        # Validate employee exists
        if not employees_collection.find_one({"_id": ObjectId(data['employeeId'])}):
            return jsonify({"error": "Employee not found"}), 400
        
        # Add timestamps
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = beneficiaries_collection.insert_one(data)
        return jsonify({"message": "Beneficiary created successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/beneficiaries/<beneficiary_id>', methods=['GET'])
def get_beneficiary(beneficiary_id):
    try:
        beneficiary = beneficiaries_collection.find_one({"_id": ObjectId(beneficiary_id)})
        if not beneficiary:
            return jsonify({"error": "Beneficiary not found"}), 404
        return jsonify(serialize_doc(beneficiary))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/beneficiaries/<beneficiary_id>', methods=['PUT'])
def update_beneficiary(beneficiary_id):
    try:
        data = request.get_json()
        data['updatedAt'] = datetime.utcnow()
        
        result = beneficiaries_collection.update_one(
            {"_id": ObjectId(beneficiary_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Beneficiary not found"}), 404
        
        return jsonify({"message": "Beneficiary updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/beneficiaries/<beneficiary_id>', methods=['DELETE'])
def delete_beneficiary(beneficiary_id):
    try:
        result = beneficiaries_collection.delete_one({"_id": ObjectId(beneficiary_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Beneficiary not found"}), 404
        
        return jsonify({"message": "Beneficiary deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Services endpoints
@app.route('/api/services', methods=['GET'])
def get_services():
    try:
        services = list(services_collection.find())
        return jsonify(serialize_doc(services))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/services', methods=['POST'])
def create_service():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['serviceId', 'date', 'patientName', 'serviceType', 'provider', 'cost', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Convert date string to datetime
        if isinstance(data['date'], str):
            data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        
        # Add timestamps
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = services_collection.insert_one(data)
        return jsonify({"message": "Service created successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/services/<service_id>', methods=['GET'])
def get_service(service_id):
    try:
        service = services_collection.find_one({"_id": ObjectId(service_id)})
        if not service:
            return jsonify({"error": "Service not found"}), 404
        return jsonify(serialize_doc(service))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/services/<service_id>', methods=['PUT'])
def update_service(service_id):
    try:
        data = request.get_json()
        data['updatedAt'] = datetime.utcnow()
        
        # Convert date string to datetime if present
        if 'date' in data and isinstance(data['date'], str):
            data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        
        result = services_collection.update_one(
            {"_id": ObjectId(service_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Service not found"}), 404
        
        return jsonify({"message": "Service updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/services/<service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        result = services_collection.delete_one({"_id": ObjectId(service_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Service not found"}), 404
        
        return jsonify({"message": "Service deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Billing endpoints
@app.route('/api/billing', methods=['GET'])
def get_billing():
    try:
        billing = list(billing_collection.find())
        return jsonify(serialize_doc(billing))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/billing', methods=['POST'])
def create_billing():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['claimId', 'serviceDate', 'patientName', 'service', 'amount', 'coverage', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Convert date string to datetime
        if isinstance(data['serviceDate'], str):
            data['serviceDate'] = datetime.fromisoformat(data['serviceDate'].replace('Z', '+00:00'))
        
        # Add timestamps
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = billing_collection.insert_one(data)
        return jsonify({"message": "Billing record created successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/billing/<billing_id>', methods=['GET'])
def get_billing_record(billing_id):
    try:
        billing = billing_collection.find_one({"_id": ObjectId(billing_id)})
        if not billing:
            return jsonify({"error": "Billing record not found"}), 404
        return jsonify(serialize_doc(billing))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/billing/<billing_id>', methods=['PUT'])
def update_billing(billing_id):
    try:
        data = request.get_json()
        data['updatedAt'] = datetime.utcnow()
        
        # Convert date string to datetime if present
        if 'serviceDate' in data and isinstance(data['serviceDate'], str):
            data['serviceDate'] = datetime.fromisoformat(data['serviceDate'].replace('Z', '+00:00'))
        
        result = billing_collection.update_one(
            {"_id": ObjectId(billing_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Billing record not found"}), 404
        
        return jsonify({"message": "Billing record updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/billing/<billing_id>', methods=['DELETE'])
def delete_billing(billing_id):
    try:
        result = billing_collection.delete_one({"_id": ObjectId(billing_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Billing record not found"}), 404
        
        return jsonify({"message": "Billing record deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Policy endpoints
@app.route('/api/policies', methods=['GET'])
def get_policies():
    try:
        policies = list(policies_collection.find())
        return jsonify(serialize_doc(policies))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/policies', methods=['POST'])
def create_policy():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['policyName', 'annualLimit', 'deductible', 'coverage', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Add timestamps
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        
        result = policies_collection.insert_one(data)
        return jsonify({"message": "Policy created successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/policies/<policy_id>', methods=['PUT'])
def update_policy(policy_id):
    try:
        data = request.get_json()
        data['updatedAt'] = datetime.utcnow()
        
        result = policies_collection.update_one(
            {"_id": ObjectId(policy_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Policy not found"}), 404
        
        return jsonify({"message": "Policy updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Reports endpoint
@app.route('/api/reports/billing', methods=['GET'])
def generate_billing_report():
    try:
        # Get date range parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = {}
        if start_date and end_date:
            query['serviceDate'] = {
                '$gte': datetime.fromisoformat(start_date),
                '$lte': datetime.fromisoformat(end_date)
            }
        
        # Aggregate billing data
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "totalAmount": {"$sum": "$amount"}
                }
            }
        ]
        
        results = list(billing_collection.aggregate(pipeline))
        
        # Get detailed records
        detailed_records = list(billing_collection.find(query))
        
        report = {
            "summary": results,
            "detailedRecords": serialize_doc(detailed_records),
            "generatedAt": datetime.utcnow().isoformat()
        }
        
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        client.admin.command('ping')
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

# Initialize sample data
@app.route('/api/initialize', methods=['POST'])
def initialize_sample_data():
    try:
        # Clear existing data
        employees_collection.delete_many({})
        beneficiaries_collection.delete_many({})
        services_collection.delete_many({})
        billing_collection.delete_many({})
        policies_collection.delete_many({})
        
        # Insert sample employees
        sample_employees = [
            {
                "employeeId": "EMP001",
                "firstName": "John",
                "lastName": "Doe",
                "department": "IT",
                "position": "Software Engineer",
                "coveragePlan": "Premium",
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "employeeId": "EMP002",
                "firstName": "Jane",
                "lastName": "Smith",
                "department": "HR",
                "position": "HR Manager",
                "coveragePlan": "Family",
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "employeeId": "EMP003",
                "firstName": "Mike",
                "lastName": "Johnson",
                "department": "Finance",
                "position": "Accountant",
                "coveragePlan": "Basic",
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        employee_results = employees_collection.insert_many(sample_employees)
        
        # Insert sample beneficiaries
        sample_beneficiaries = [
            {
                "beneficiaryId": "BEN001",
                "firstName": "Sarah",
                "lastName": "Doe",
                "relationship": "spouse",
                "employeeId": str(employee_results.inserted_ids[0]),
                "coverage": "Premium",
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "beneficiaryId": "BEN002",
                "firstName": "Tom",
                "lastName": "Smith",
                "relationship": "child",
                "employeeId": str(employee_results.inserted_ids[1]),
                "coverage": "Family",
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        beneficiaries_collection.insert_many(sample_beneficiaries)
        
        # Insert sample services
        sample_services = [
            {
                "serviceId": "SRV001",
                "date": datetime.utcnow() - timedelta(days=30),
                "patientName": "John Doe",
                "serviceType": "Consultation",
                "provider": "City Hospital",
                "cost": 150,
                "status": "Processed",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "serviceId": "SRV002",
                "date": datetime.utcnow() - timedelta(days=15),
                "patientName": "Sarah Doe",
                "serviceType": "Diagnostic",
                "provider": "Med Lab",
                "cost": 300,
                "status": "Pending",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        services_collection.insert_many(sample_services)
        
        # Insert sample billing
        sample_billing = [
            {
                "claimId": "CLM001",
                "serviceDate": datetime.utcnow() - timedelta(days=30),
                "patientName": "John Doe",
                "service": "Consultation",
                "amount": 150,
                "coverage": 80,
                "status": "Processed",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "claimId": "CLM002",
                "serviceDate": datetime.utcnow() - timedelta(days=15),
                "patientName": "Sarah Doe",
                "service": "Diagnostic",
                "amount": 300,
                "coverage": 90,
                "status": "Pending",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        billing_collection.insert_many(sample_billing)
        
        # Insert sample policies
        sample_policies = [
            {
                "policyName": "Basic Coverage",
                "annualLimit": 5000,
                "deductible": 500,
                "coverage": 80,
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "policyName": "Premium Coverage",
                "annualLimit": 15000,
                "deductible": 250,
                "coverage": 90,
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "policyName": "Family Coverage",
                "annualLimit": 25000,
                "deductible": 200,
                "coverage": 95,
                "status": "Active",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        policies_collection.insert_many(sample_policies)
        
        return jsonify({"message": "Sample data initialized successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)