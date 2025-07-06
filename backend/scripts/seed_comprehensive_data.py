#!/usr/bin/env python3
"""
CounselFlow Ultimate V3 - Comprehensive Database Seeding Script
================================================================

This script seeds the database with realistic legal data for development and demo purposes.
Includes all major entities: users, clients, contracts, matters, IP assets, disputes, etc.

Usage:
    python seed_comprehensive_data.py [--reset] [--count=N]
    
Options:
    --reset     Drop all data before seeding
    --count=N   Number of records to create for each entity (default: 50)
"""

import asyncio
import argparse
import random
import json
from datetime import datetime, timedelta
from decimal import Decimal
from faker import Faker
from prisma import Prisma
from typing import List, Dict, Any
import bcrypt

# Initialize Faker for generating realistic data
fake = Faker(['en_US', 'en_GB', 'fr_FR', 'de_DE'])
Faker.seed(42)  # For reproducible data

# Constants for realistic legal data
LEGAL_INDUSTRIES = [
    "Technology", "Healthcare", "Financial Services", "Manufacturing", 
    "Retail", "Real Estate", "Energy", "Telecommunications", "Aerospace",
    "Pharmaceutical", "Automotive", "Media & Entertainment", "Education",
    "Government", "Non-Profit", "Consulting", "Transportation", "Agriculture"
]

LAW_FIRMS = [
    "Cravath, Swaine & Moore", "Skadden, Arps, Slate, Meagher & Flom",
    "Latham & Watkins", "Baker McKenzie", "DLA Piper", "Kirkland & Ellis",
    "White & Case", "Freshfields Bruckhaus Deringer", "Allen & Overy",
    "Clifford Chance", "Linklaters", "Sullivan & Cromwell", "Davis Polk",
    "Simpson Thacher & Bartlett", "Wachtell, Lipton, Rosen & Katz"
]

JURISDICTIONS = ["US", "UK", "EU", "CA", "AU", "DE", "FR", "JP", "SG"]

CONTRACT_TEMPLATES = {
    "NDA": {
        "title_patterns": ["Mutual Non-Disclosure Agreement", "Confidentiality Agreement", "NDA with {company}"],
        "risk_factors": ["overly broad scope", "unlimited duration", "unclear return obligations"]
    },
    "MSA": {
        "title_patterns": ["Master Service Agreement", "MSA - {company}", "Professional Services Agreement"],
        "risk_factors": ["unlimited liability", "broad indemnification", "IP ownership unclear"]
    },
    "EMPLOYMENT": {
        "title_patterns": ["Employment Agreement - {role}", "Executive Employment Contract", "Consulting Agreement"],
        "risk_factors": ["non-compete too broad", "stock option vesting", "severance terms"]
    },
    "LICENSING": {
        "title_patterns": ["Software License Agreement", "IP License - {tech}", "Technology Transfer Agreement"],
        "risk_factors": ["exclusive vs non-exclusive", "territory restrictions", "royalty calculations"]
    }
}

MATTER_TEMPLATES = {
    "LITIGATION": {
        "title_patterns": ["Contract Dispute vs {company}", "IP Infringement Case", "Employment Litigation"],
        "descriptions": ["Commercial litigation regarding breach of contract", "Patent infringement claims", "Employment discrimination case"]
    },
    "CORPORATE": {
        "title_patterns": ["M&A Due Diligence", "Corporate Restructuring", "Securities Compliance"],
        "descriptions": ["Merger and acquisition transaction support", "Corporate governance matters", "SEC filing compliance"]
    },
    "IP_ENFORCEMENT": {
        "title_patterns": ["Patent Portfolio Review", "Trademark Opposition", "Trade Secret Protection"],
        "descriptions": ["IP portfolio management and enforcement", "Trademark registration and protection", "Trade secret litigation"]
    }
}

class CounselFlowSeeder:
    def __init__(self, count: int = 50):
        self.db = Prisma()
        self.count = count
        self.created_entities = {
            'users': [],
            'clients': [],
            'contracts': [],
            'matters': [],
            'ip_assets': [],
            'disputes': [],
            'tasks': [],
            'risks': []
        }

    async def connect(self):
        """Connect to the database"""
        await self.db.connect()
        print("✅ Connected to database")

    async def disconnect(self):
        """Disconnect from the database"""
        await self.db.disconnect()
        print("✅ Disconnected from database")

    async def reset_database(self):
        """Reset all data in the database"""
        print("🗑️  Resetting database...")
        
        # Delete in correct order to avoid foreign key constraints
        tables = [
            'ai_tasks', 'audit_logs', 'notifications', 'timeline_events',
            'obligations', 'clauses', 'licenses', 'filings', 'tasks',
            'documents', 'disputes', 'privacy_events', 'data_subject_requests',
            'pia_assessments', 'incident_reports', 'compliance_requirements',
            'risk_events', 'contracts', 'ip_assets', 'matters', 'clients', 'users'
        ]
        
        for table in tables:
            try:
                await self.db.execute_raw(f'DELETE FROM "{table}" CASCADE;')
                print(f"   Cleared {table}")
            except Exception as e:
                print(f"   Warning: Could not clear {table}: {e}")
        
        print("✅ Database reset complete")

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    async def seed_users(self):
        """Create realistic legal users with different roles"""
        print(f"👥 Creating {self.count} users...")
        
        # Define role distribution for realistic legal organization
        role_distribution = [
            ("ADMIN", 2),
            ("IN_HOUSE_COUNSEL", int(self.count * 0.3)),
            ("LEGAL_OPS", int(self.count * 0.15)),
            ("EXTERNAL_COUNSEL", int(self.count * 0.25)),
            ("BUSINESS_STAKEHOLDER", int(self.count * 0.2)),
            ("CLIENT", int(self.count * 0.1))
        ]
        
        users = []
        for role, count in role_distribution:
            for i in range(count):
                first_name = fake.first_name()
                last_name = fake.last_name()
                
                user_data = {
                    'email': f"{first_name.lower()}.{last_name.lower()}@{fake.company_email().split('@')[1]}",
                    'firstName': first_name,
                    'lastName': last_name,
                    'role': role,
                    'status': random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE']),  # 75% active
                    'hashedPassword': self.hash_password('CounselFlow2024!'),
                    'title': self.generate_legal_title(role),
                    'department': self.generate_department(role),
                    'phone': fake.phone_number(),
                    'timezone': random.choice(['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London']),
                    'lastLogin': fake.date_time_between(start_date='-30d', end_date='now') if random.random() > 0.2 else None
                }
                
                user = await self.db.user.create(data=user_data)
                users.append(user)
        
        self.created_entities['users'] = users
        print(f"✅ Created {len(users)} users")

    def generate_legal_title(self, role: str) -> str:
        """Generate appropriate job titles for legal roles"""
        titles = {
            'ADMIN': ['System Administrator', 'IT Director', 'Chief Technology Officer'],
            'IN_HOUSE_COUNSEL': ['Senior Legal Counsel', 'Associate General Counsel', 'Chief Legal Officer', 'Legal Director'],
            'LEGAL_OPS': ['Legal Operations Manager', 'Legal Technology Specialist', 'Contract Manager'],
            'EXTERNAL_COUNSEL': ['Partner', 'Senior Associate', 'Associate', 'Of Counsel'],
            'BUSINESS_STAKEHOLDER': ['VP of Operations', 'Director of Compliance', 'Business Unit Leader'],
            'CLIENT': ['CEO', 'General Manager', 'Director of Legal Affairs', 'Compliance Officer']
        }
        return random.choice(titles.get(role, ['Legal Professional']))

    def generate_department(self, role: str) -> str:
        """Generate appropriate departments"""
        departments = {
            'ADMIN': ['IT', 'Technology', 'Systems'],
            'IN_HOUSE_COUNSEL': ['Legal', 'Corporate Legal', 'Legal Affairs'],
            'LEGAL_OPS': ['Legal Operations', 'Legal Technology', 'Contract Management'],
            'EXTERNAL_COUNSEL': ['Litigation', 'Corporate', 'IP & Technology', 'Employment'],
            'BUSINESS_STAKEHOLDER': ['Operations', 'Compliance', 'Business Development'],
            'CLIENT': ['Executive', 'Legal', 'Compliance', 'Operations']
        }
        return random.choice(departments.get(role, ['Legal']))

    async def seed_clients(self):
        """Create diverse client organizations"""
        print(f"🏢 Creating {self.count} clients...")
        
        clients = []
        for i in range(self.count):
            company_name = fake.company()
            
            client_data = {
                'name': company_name,
                'type': random.choice(['CORPORATE', 'ENTERPRISE', 'STARTUP', 'NON_PROFIT', 'GOVERNMENT']),
                'status': random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PROSPECT', 'FORMER_CLIENT']),
                'contactPerson': fake.name(),
                'email': f"legal@{company_name.lower().replace(' ', '').replace(',', '')}.com",
                'phone': fake.phone_number(),
                'website': f"www.{company_name.lower().replace(' ', '').replace(',', '')}.com",
                'addressLine1': fake.street_address(),
                'city': fake.city(),
                'state': fake.state_abbr(),
                'postalCode': fake.zipcode(),
                'country': random.choice(['US', 'CA', 'UK', 'DE', 'FR']),
                'industry': random.choice(LEGAL_INDUSTRIES),
                'revenue': Decimal(str(random.uniform(1000000, 5000000000))),
                'employeeCount': random.randint(50, 50000)
            }
            
            client = await self.db.client.create(data=client_data)
            clients.append(client)
        
        self.created_entities['clients'] = clients
        print(f"✅ Created {len(clients)} clients")

    async def seed_contracts(self):
        """Create realistic legal contracts"""
        print(f"📄 Creating {int(self.count * 1.5)} contracts...")
        
        users = self.created_entities['users']
        clients = self.created_entities['clients']
        legal_users = [u for u in users if u.role in ['IN_HOUSE_COUNSEL', 'LEGAL_OPS']]
        
        contracts = []
        contract_count = int(self.count * 1.5)
        
        for i in range(contract_count):
            contract_type = random.choice(list(CONTRACT_TEMPLATES.keys()))
            template = CONTRACT_TEMPLATES[contract_type]
            client = random.choice(clients)
            creator = random.choice(legal_users)
            
            # Generate realistic contract content
            title_pattern = random.choice(template['title_patterns'])
            title = title_pattern.format(
                company=client.name,
                role=fake.job(),
                tech=random.choice(['Software', 'AI Technology', 'Data Platform', 'Analytics'])
            )
            
            # AI risk analysis simulation
            risk_factors = template['risk_factors']
            ai_risk_score = random.uniform(0.1, 0.9)
            risk_level = 'CRITICAL' if ai_risk_score > 0.8 else 'HIGH' if ai_risk_score > 0.6 else 'MEDIUM' if ai_risk_score > 0.3 else 'LOW'
            
            contract_data = {
                'title': title,
                'type': contract_type,
                'status': random.choice(['DRAFT', 'UNDER_REVIEW', 'EXECUTED', 'EXECUTED', 'EXECUTED']),  # More executed
                'clientId': client.id,
                'counterparty': fake.company(),
                'content': self.generate_contract_content(contract_type, client.name),
                'aiRiskScore': ai_risk_score,
                'riskLevel': risk_level,
                'aiSummary': f"AI Analysis: {random.choice(risk_factors)}. Confidence: {random.randint(85, 98)}%",
                'value': Decimal(str(random.uniform(10000, 5000000))),
                'currency': random.choice(['USD', 'EUR', 'GBP']),
                'effectiveDate': fake.date_between(start_date='-2y', end_date='+1y'),
                'expirationDate': fake.date_between(start_date='+1y', end_date='+5y'),
                'signedDate': fake.date_between(start_date='-1y', end_date='now') if random.random() > 0.3 else None,
                'priority': random.choice(['LOW', 'MEDIUM', 'HIGH', 'HIGH']),  # Bias toward higher priority
                'tags': random.sample(['confidential', 'high-value', 'renewal', 'standard', 'custom'], k=random.randint(1, 3)),
                'createdById': creator.id
            }
            
            contract = await self.db.contract.create(data=contract_data)
            contracts.append(contract)
            
            # Create contract clauses
            await self.create_contract_clauses(contract)
            
            # Create obligations
            await self.create_contract_obligations(contract)
        
        self.created_entities['contracts'] = contracts
        print(f"✅ Created {len(contracts)} contracts with clauses and obligations")

    def generate_contract_content(self, contract_type: str, client_name: str) -> str:
        """Generate realistic contract content"""
        content_templates = {
            'NDA': f"""
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into between {client_name} and the counterparty.

1. CONFIDENTIAL INFORMATION
Each party may disclose proprietary and confidential information to the other party.

2. OBLIGATIONS
The receiving party agrees to:
- Maintain confidentiality of all disclosed information
- Use information solely for evaluation purposes
- Return or destroy information upon request

3. TERM
This Agreement shall remain in effect for a period of three (3) years.

[Additional standard clauses...]
            """,
            'MSA': f"""
MASTER SERVICE AGREEMENT

This Master Service Agreement ("MSA") is between {client_name} and Service Provider.

1. SERVICES
Provider shall perform professional services as detailed in Statements of Work.

2. COMPENSATION
Client shall pay fees as specified in each SOW within 30 days of invoice.

3. INTELLECTUAL PROPERTY
All work product shall be owned by Client upon full payment.

[Additional terms and conditions...]
            """,
            'EMPLOYMENT': f"""
EMPLOYMENT AGREEMENT

This Employment Agreement is between {client_name} ("Company") and Employee.

1. POSITION
Employee shall serve as [Position Title] reporting to [Manager].

2. COMPENSATION
Base salary, benefits, and equity compensation as detailed herein.

3. CONFIDENTIALITY
Employee agrees to maintain confidentiality of Company information.

[Additional employment terms...]
            """
        }
        
        return content_templates.get(contract_type, f"Standard {contract_type} agreement between {client_name} and counterparty.")

    async def create_contract_clauses(self, contract):
        """Create realistic contract clauses"""
        clause_types = ['liability', 'termination', 'confidentiality', 'payment', 'intellectual_property']
        
        for i, clause_type in enumerate(random.sample(clause_types, k=random.randint(3, 5))):
            clause_data = {
                'contractId': contract.id,
                'text': f"Standard {clause_type} clause with specific terms and conditions applicable to this agreement.",
                'clauseType': clause_type,
                'riskRating': random.choice(['LOW', 'MEDIUM', 'HIGH']),
                'suggestedRevision': f"Consider revising {clause_type} terms for better protection" if random.random() > 0.7 else None,
                'source': random.choice(['Template Library', 'AI Generated', 'Custom Drafted']),
                'position': i + 1
            }
            
            await self.db.clause.create(data=clause_data)

    async def create_contract_obligations(self, contract):
        """Create contract obligations"""
        obligation_types = ['PAYMENT', 'DELIVERY', 'COMPLIANCE', 'REPORTING', 'RENEWAL']
        
        for obligation_type in random.sample(obligation_types, k=random.randint(2, 4)):
            obligation_data = {
                'contractId': contract.id,
                'type': obligation_type,
                'status': random.choice(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
                'title': f"{obligation_type.replace('_', ' ').title()} Obligation",
                'description': f"Detailed requirements for {obligation_type.lower()} obligations under this contract.",
                'responsible': random.choice([contract.counterparty, 'Client']),
                'dueDate': fake.date_between(start_date='now', end_date='+1y') if random.random() > 0.3 else None
            }
            
            await self.db.obligation.create(data=obligation_data)

    async def seed_matters(self):
        """Create legal matters"""
        print(f"⚖️  Creating {self.count} matters...")
        
        users = self.created_entities['users']
        clients = self.created_entities['clients']
        legal_users = [u for u in users if u.role in ['IN_HOUSE_COUNSEL', 'EXTERNAL_COUNSEL']]
        
        matters = []
        for i in range(self.count):
            matter_type = random.choice(list(MATTER_TEMPLATES.keys()))
            template = MATTER_TEMPLATES[matter_type]
            client = random.choice(clients)
            creator = random.choice(legal_users)
            assignee = random.choice(legal_users) if random.random() > 0.2 else None
            
            title_pattern = random.choice(template['title_patterns'])
            title = title_pattern.format(company=fake.company())
            
            matter_data = {
                'title': title,
                'description': random.choice(template['descriptions']),
                'type': matter_type,
                'status': random.choice(['OPEN', 'ACTIVE', 'ACTIVE', 'ON_HOLD', 'CLOSED']),
                'priority': random.choice(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
                'clientId': client.id,
                'budget': Decimal(str(random.uniform(50000, 2000000))),
                'spentAmount': Decimal(str(random.uniform(0, 500000))),
                'billingRate': Decimal(str(random.uniform(300, 1500))),
                'startDate': fake.date_between(start_date='-2y', end_date='now'),
                'targetCloseDate': fake.date_between(start_date='now', end_date='+1y'),
                'assignedToId': assignee.id if assignee else None,
                'createdById': creator.id,
                'externalFirm': random.choice(LAW_FIRMS) if random.random() > 0.6 else None,
                'externalContact': fake.name() if random.random() > 0.6 else None,
                'aiSummary': f"AI-generated summary: {random.choice(['High-priority matter requiring immediate attention', 'Standard matter proceeding as expected', 'Complex matter with multiple stakeholders'])}",
                'suggestedBudget': Decimal(str(random.uniform(75000, 1500000))),
                'tags': random.sample(['urgent', 'complex', 'international', 'regulatory', 'confidential'], k=random.randint(1, 3))
            }
            
            matter = await self.db.matter.create(data=matter_data)
            matters.append(matter)
        
        self.created_entities['matters'] = matters
        print(f"✅ Created {len(matters)} matters")

    async def seed_ip_assets(self):
        """Create IP assets"""
        print(f"🔬 Creating {int(self.count * 0.8)} IP assets...")
        
        clients = self.created_entities['clients']
        tech_clients = [c for c in clients if c.industry in ['Technology', 'Pharmaceutical', 'Aerospace']]
        if not tech_clients:
            tech_clients = clients[:int(len(clients) * 0.3)]  # Use first 30% as tech clients
        
        ip_assets = []
        ip_count = int(self.count * 0.8)
        
        for i in range(ip_count):
            client = random.choice(tech_clients)
            ip_type = random.choice(['PATENT', 'TRADEMARK', 'COPYRIGHT', 'TRADE_SECRET'])
            
            ip_data = {
                'title': self.generate_ip_title(ip_type),
                'type': ip_type,
                'status': random.choice(['IDEA', 'APPLICATION_FILED', 'UNDER_EXAMINATION', 'GRANTED', 'PUBLISHED']),
                'applicationNumber': f"{random.choice(['US', 'EP', 'WO'])}{random.randint(10000000, 99999999)}" if random.random() > 0.3 else None,
                'registrationNumber': f"REG{random.randint(1000000, 9999999)}" if random.random() > 0.5 else None,
                'description': f"Innovative {ip_type.lower()} asset in the field of {client.industry.lower()}",
                'inventors': [fake.name() for _ in range(random.randint(1, 4))],
                'jurisdiction': random.sample(JURISDICTIONS, k=random.randint(1, 3)),
                'priorityDate': fake.date_between(start_date='-5y', end_date='-1y'),
                'filingDate': fake.date_between(start_date='-3y', end_date='now'),
                'clientId': client.id,
                'estimatedValue': Decimal(str(random.uniform(100000, 10000000))),
                'priorArtScore': random.uniform(0.1, 0.9),
                'strengthScore': random.uniform(0.3, 0.95)
            }
            
            ip_asset = await self.db.ipasset.create(data=ip_data)
            ip_assets.append(ip_asset)
        
        self.created_entities['ip_assets'] = ip_assets
        print(f"✅ Created {len(ip_assets)} IP assets")

    def generate_ip_title(self, ip_type: str) -> str:
        """Generate realistic IP asset titles"""
        if ip_type == 'PATENT':
            return f"Method and System for {random.choice(['Data Processing', 'Machine Learning', 'Wireless Communication', 'Energy Storage'])}"
        elif ip_type == 'TRADEMARK':
            return f"{fake.company()} {random.choice(['Logo', 'Brand Name', 'Service Mark'])}"
        elif ip_type == 'COPYRIGHT':
            return f"{random.choice(['Software', 'Documentation', 'Training Materials', 'Website Content'])}"
        else:  # TRADE_SECRET
            return f"Proprietary {random.choice(['Algorithm', 'Formula', 'Process', 'Design Methodology'])}"

    async def seed_disputes(self):
        """Create dispute cases"""
        print(f"⚔️  Creating {int(self.count * 0.3)} disputes...")
        
        users = self.created_entities['users']
        clients = self.created_entities['clients']
        matters = self.created_entities['matters']
        legal_users = [u for u in users if u.role in ['IN_HOUSE_COUNSEL', 'EXTERNAL_COUNSEL']]
        
        disputes = []
        dispute_count = int(self.count * 0.3)
        
        for i in range(dispute_count):
            client = random.choice(clients)
            assignee = random.choice(legal_users)
            matter = random.choice(matters) if random.random() > 0.5 else None
            
            dispute_type = random.choice(['CONTRACT_DISPUTE', 'IP_INFRINGEMENT', 'EMPLOYMENT_DISPUTE', 'COMMERCIAL_LITIGATION'])
            
            dispute_data = {
                'title': self.generate_dispute_title(dispute_type, client.name),
                'description': f"Legal dispute involving {dispute_type.replace('_', ' ').lower()}",
                'type': dispute_type,
                'status': random.choice(['POTENTIAL', 'FILED', 'DISCOVERY', 'MEDIATION', 'SETTLED', 'DISMISSED']),
                'clientId': client.id,
                'opposingParty': fake.company(),
                'opposingCounsel': f"{fake.name()} at {random.choice(LAW_FIRMS)}",
                'caseNumber': f"{random.choice(['CV', 'C', 'CA'])}-{random.randint(1000, 9999)}-{random.randint(10, 99)}",
                'court': random.choice(['US District Court', 'Superior Court', 'Court of Appeals', 'Supreme Court']),
                'jurisdiction': random.choice(JURISDICTIONS),
                'amountInDispute': Decimal(str(random.uniform(100000, 50000000))),
                'estimatedCosts': Decimal(str(random.uniform(50000, 5000000))),
                'externalFirm': random.choice(LAW_FIRMS),
                'externalContact': fake.name(),
                'incidentDate': fake.date_between(start_date='-3y', end_date='-6m'),
                'filedDate': fake.date_between(start_date='-2y', end_date='now') if random.random() > 0.3 else None,
                'strategy': f"Legal strategy focusing on {random.choice(['motion to dismiss', 'summary judgment', 'settlement negotiation'])}",
                'strengths': "Strong factual foundation and clear contractual terms",
                'weaknesses': "Potential challenges with witness availability",
                'aiInsights': f"AI predicts {random.randint(60, 85)}% likelihood of favorable outcome",
                'outcomePredictor': random.uniform(0.4, 0.9),
                'assignedToId': assignee.id,
                'matterId': matter.id if matter else None,
                'tags': random.sample(['high-stakes', 'precedent-setting', 'confidential', 'international'], k=random.randint(1, 3))
            }
            
            dispute = await self.db.dispute.create(data=dispute_data)
            disputes.append(dispute)
        
        self.created_entities['disputes'] = disputes
        print(f"✅ Created {len(disputes)} disputes")

    def generate_dispute_title(self, dispute_type: str, client_name: str) -> str:
        """Generate realistic dispute titles"""
        titles = {
            'CONTRACT_DISPUTE': f"{client_name} v. {fake.company()} - Contract Breach",
            'IP_INFRINGEMENT': f"{client_name} v. {fake.company()} - Patent Infringement",
            'EMPLOYMENT_DISPUTE': f"Employment Litigation - {client_name}",
            'COMMERCIAL_LITIGATION': f"Commercial Dispute - {client_name} v. {fake.company()}"
        }
        return titles.get(dispute_type, f"{dispute_type.replace('_', ' ')} - {client_name}")

    async def seed_tasks(self):
        """Create legal tasks"""
        print(f"📋 Creating {int(self.count * 2)} tasks...")
        
        users = self.created_entities['users']
        matters = self.created_entities['matters']
        legal_users = [u for u in users if u.role in ['IN_HOUSE_COUNSEL', 'LEGAL_OPS', 'EXTERNAL_COUNSEL']]
        
        tasks = []
        task_count = int(self.count * 2)
        
        for i in range(task_count):
            assignee = random.choice(legal_users)
            matter = random.choice(matters) if random.random() > 0.3 else None
            task_type = random.choice(['RESEARCH', 'DRAFTING', 'REVIEW', 'FILING', 'CLIENT_MEETING', 'DEADLINE'])
            
            task_data = {
                'title': self.generate_task_title(task_type),
                'description': f"Detailed task description for {task_type.lower()} work",
                'type': task_type,
                'status': random.choice(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED']),  # Bias toward completed
                'priority': random.choice(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
                'matterId': matter.id if matter else None,
                'assignedToId': assignee.id,
                'dueDate': fake.date_between(start_date='-1m', end_date='+3m'),
                'estimatedHours': random.uniform(0.5, 40.0),
                'actualHours': random.uniform(0.5, 35.0) if random.random() > 0.4 else None,
                'tags': random.sample(['urgent', 'research', 'client-facing', 'internal'], k=random.randint(1, 2))
            }
            
            task = await self.db.task.create(data=task_data)
            tasks.append(task)
        
        self.created_entities['tasks'] = tasks
        print(f"✅ Created {len(tasks)} tasks")

    def generate_task_title(self, task_type: str) -> str:
        """Generate realistic task titles"""
        titles = {
            'RESEARCH': random.choice(['Legal precedent research', 'Regulatory compliance review', 'Case law analysis']),
            'DRAFTING': random.choice(['Contract drafting', 'Legal memo preparation', 'Brief writing']),
            'REVIEW': random.choice(['Document review', 'Contract analysis', 'Compliance audit']),
            'FILING': random.choice(['Court filing preparation', 'Regulatory submission', 'Patent application']),
            'CLIENT_MEETING': random.choice(['Client consultation', 'Strategy session', 'Case update meeting']),
            'DEADLINE': random.choice(['Filing deadline', 'Response due date', 'Discovery cutoff'])
        }
        return titles.get(task_type, f"{task_type.replace('_', ' ').title()} Task")

    async def seed_risk_events(self):
        """Create risk management events"""
        print(f"⚠️  Creating {int(self.count * 0.8)} risk events...")
        
        users = self.created_entities['users']
        clients = self.created_entities['clients']
        matters = self.created_entities['matters']
        legal_users = [u for u in users if u.role in ['IN_HOUSE_COUNSEL', 'LEGAL_OPS']]
        
        risk_events = []
        risk_count = int(self.count * 0.8)
        
        for i in range(risk_count):
            creator = random.choice(legal_users)
            client = random.choice(clients) if random.random() > 0.3 else None
            matter = random.choice(matters) if random.random() > 0.5 else None
            
            risk_type = random.choice(['LEGAL', 'REGULATORY', 'COMPLIANCE', 'CONTRACT_BREACH', 'LITIGATION'])
            likelihood = random.randint(1, 5)
            impact = random.randint(1, 5)
            
            risk_data = {
                'title': self.generate_risk_title(risk_type),
                'description': f"Detailed risk assessment for {risk_type.lower()} exposure",
                'type': risk_type,
                'status': random.choice(['IDENTIFIED', 'UNDER_ASSESSMENT', 'MITIGATION_PLANNED', 'MITIGATED']),
                'likelihood': likelihood,
                'impact': impact,
                'riskScore': float(likelihood * impact),
                'potentialLoss': Decimal(str(random.uniform(50000, 10000000))),
                'mitigationCost': Decimal(str(random.uniform(10000, 500000))),
                'createdById': creator.id,
                'clientId': client.id if client else None,
                'matterId': matter.id if matter else None,
                'mitigationPlan': f"Comprehensive mitigation strategy for {risk_type.lower()} risk",
                'aiInsights': f"AI analysis suggests {random.choice(['immediate action required', 'monitor closely', 'standard mitigation protocols'])}",
                'tags': random.sample(['critical', 'regulatory', 'financial', 'operational'], k=random.randint(1, 2))
            }
            
            risk_event = await self.db.riskevent.create(data=risk_data)
            risk_events.append(risk_event)
        
        self.created_entities['risks'] = risk_events
        print(f"✅ Created {len(risk_events)} risk events")

    def generate_risk_title(self, risk_type: str) -> str:
        """Generate realistic risk titles"""
        titles = {
            'LEGAL': random.choice(['Contract interpretation dispute risk', 'Liability exposure assessment', 'Indemnification gap analysis']),
            'REGULATORY': random.choice(['Compliance deadline risk', 'Regulatory change impact', 'Audit preparation requirements']),
            'COMPLIANCE': random.choice(['GDPR compliance gap', 'SOX reporting requirements', 'Industry standard adherence']),
            'CONTRACT_BREACH': random.choice(['Vendor contract breach risk', 'Service level agreement violation', 'Payment default exposure']),
            'LITIGATION': random.choice(['Potential litigation exposure', 'Class action risk assessment', 'Intellectual property dispute'])
        }
        return titles.get(risk_type, f"{risk_type.replace('_', ' ').title()} Risk")

    async def seed_ai_tasks(self):
        """Create AI task history"""
        print(f"🤖 Creating {int(self.count * 3)} AI tasks...")
        
        users = self.created_entities['users']
        contracts = self.created_entities['contracts']
        
        ai_tasks = []
        task_count = int(self.count * 3)
        
        for i in range(task_count):
            user = random.choice(users)
            task_type = random.choice(['CONTRACT_ANALYSIS', 'LEGAL_RESEARCH', 'DOCUMENT_GENERATION', 'RISK_ASSESSMENT'])
            
            # Simulate AI task processing
            start_time = fake.date_time_between(start_date='-30d', end_date='now')
            processing_time = random.randint(1000, 30000)  # milliseconds
            
            ai_task_data = {
                'type': task_type,
                'status': random.choice(['COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED']),  # Mostly successful
                'inputData': self.generate_ai_input_data(task_type),
                'result': self.generate_ai_result(task_type) if random.random() > 0.1 else None,
                'confidence': random.uniform(0.7, 0.98),
                'tokens': random.randint(100, 4000),
                'model': random.choice(['GPT-4', 'Claude-3', 'Gemini-Pro']),
                'startedAt': start_time,
                'completedAt': start_time + timedelta(milliseconds=processing_time),
                'processingTime': processing_time,
                'userId': user.id
            }
            
            ai_task = await self.db.aitask.create(data=ai_task_data)
            ai_tasks.append(ai_task)
        
        print(f"✅ Created {len(ai_tasks)} AI tasks")

    def generate_ai_input_data(self, task_type: str) -> Dict[str, Any]:
        """Generate realistic AI input data"""
        inputs = {
            'CONTRACT_ANALYSIS': {
                'contract_text': 'Sample contract content for analysis...',
                'analysis_type': 'risk_assessment',
                'focus_areas': ['liability', 'termination', 'ip_rights']
            },
            'LEGAL_RESEARCH': {
                'query': 'Recent precedents in contract interpretation',
                'jurisdiction': random.choice(JURISDICTIONS),
                'practice_area': 'contract_law'
            },
            'DOCUMENT_GENERATION': {
                'document_type': 'NDA',
                'parties': ['Company A', 'Company B'],
                'key_terms': {'duration': '3 years', 'territory': 'global'}
            },
            'RISK_ASSESSMENT': {
                'scenario': 'New vendor agreement evaluation',
                'risk_factors': ['financial', 'operational', 'legal']
            }
        }
        return inputs.get(task_type, {})

    def generate_ai_result(self, task_type: str) -> Dict[str, Any]:
        """Generate realistic AI results"""
        results = {
            'CONTRACT_ANALYSIS': {
                'risk_score': random.uniform(0.2, 0.8),
                'key_risks': ['Broad indemnification clause', 'Unlimited liability exposure'],
                'recommendations': ['Add liability caps', 'Clarify termination procedures'],
                'confidence': random.uniform(0.85, 0.98)
            },
            'LEGAL_RESEARCH': {
                'relevant_cases': ['Case A v. Case B (2023)', 'Contract Corp v. Legal Inc (2022)'],
                'key_principles': ['Good faith interpretation', 'Commercial reasonableness'],
                'jurisdiction_notes': 'Recent trends favor narrow interpretation'
            },
            'DOCUMENT_GENERATION': {
                'generated_text': 'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement...',
                'clauses_included': ['confidentiality', 'return_of_materials', 'term'],
                'suggestions': ['Consider adding specific penalties clause']
            },
            'RISK_ASSESSMENT': {
                'overall_risk': random.choice(['LOW', 'MEDIUM', 'HIGH']),
                'risk_breakdown': {'financial': 0.3, 'operational': 0.6, 'legal': 0.4},
                'mitigation_steps': ['Due diligence review', 'Insurance verification']
            }
        }
        return results.get(task_type, {})

    async def seed_audit_logs(self):
        """Create audit trail"""
        print(f"📊 Creating {int(self.count * 5)} audit logs...")
        
        users = self.created_entities['users']
        
        audit_count = int(self.count * 5)
        for i in range(audit_count):
            user = random.choice(users)
            event_type = random.choice(['LOGIN', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'])
            
            audit_data = {
                'userId': user.id,
                'eventType': event_type,
                'resource': random.choice(['contracts', 'matters', 'clients', 'documents']),
                'resourceId': fake.uuid4(),
                'action': f"{event_type.lower()}_resource",
                'ipAddress': fake.ipv4(),
                'userAgent': fake.user_agent(),
                'success': random.random() > 0.05,  # 95% success rate
                'timestamp': fake.date_time_between(start_date='-90d', end_date='now')
            }
            
            await self.db.auditlog.create(data=audit_data)
        
        print(f"✅ Created {audit_count} audit logs")

    async def seed_all(self):
        """Seed all entities in correct dependency order"""
        print(f"\n🌱 Starting comprehensive data seeding (count: {self.count})")
        print("=" * 60)
        
        # Seed in dependency order
        await self.seed_users()
        await self.seed_clients()
        await self.seed_contracts()
        await self.seed_matters()
        await self.seed_ip_assets()
        await self.seed_disputes()
        await self.seed_tasks()
        await self.seed_risk_events()
        await self.seed_ai_tasks()
        await self.seed_audit_logs()
        
        print("\n" + "=" * 60)
        print("🎉 SEEDING COMPLETE!")
        print(f"📊 Summary:")
        for entity_type, entities in self.created_entities.items():
            if entities:
                print(f"   {entity_type.replace('_', ' ').title()}: {len(entities)}")
        
        print(f"\n✅ CounselFlow Ultimate V3 database is ready with comprehensive legal data!")

    async def run_seed(self, reset: bool = False):
        """Run the complete seeding process"""
        try:
            await self.connect()
            
            if reset:
                await self.reset_database()
            
            await self.seed_all()
            
        except Exception as e:
            print(f"❌ Seeding failed: {e}")
            raise
        finally:
            await self.disconnect()

async def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description='Seed CounselFlow database with comprehensive legal data')
    parser.add_argument('--reset', action='store_true', help='Reset database before seeding')
    parser.add_argument('--count', type=int, default=50, help='Number of base records to create')
    
    args = parser.parse_args()
    
    seeder = CounselFlowSeeder(count=args.count)
    await seeder.run_seed(reset=args.reset)

if __name__ == "__main__":
    asyncio.run(main())