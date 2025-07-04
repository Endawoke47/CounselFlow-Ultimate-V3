from typing import List, Dict, Any, Optional
import openai
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
import json
from ..core.config import settings

class AIService:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            self.llm = OpenAI(temperature=0.7, openai_api_key=settings.OPENAI_API_KEY)
        else:
            self.llm = None
    
    def _check_api_key(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
    
    async def analyze_contract(self, contract_text: str) -> Dict[str, Any]:
        """Analyze contract and identify key clauses, risks, and issues"""
        self._check_api_key()
        
        prompt = PromptTemplate(
            input_variables=["contract"],
            template="""
            Analyze the following contract and provide a comprehensive analysis:

            Contract Text:
            {contract}

            Please provide analysis in the following JSON format:
            {{
                "summary": "Brief summary of the contract",
                "contract_type": "Type of contract (e.g., NDA, Service Agreement, etc.)",
                "key_terms": [
                    {{
                        "term": "Term name",
                        "description": "Description of the term",
                        "importance": "high/medium/low"
                    }}
                ],
                "potential_risks": [
                    {{
                        "risk": "Risk description",
                        "severity": "high/medium/low",
                        "recommendation": "Suggested action"
                    }}
                ],
                "missing_clauses": [
                    "List of important clauses that might be missing"
                ],
                "compliance_notes": [
                    "Compliance considerations"
                ],
                "negotiation_points": [
                    "Key points for negotiation"
                ]
            }}
            
            Provide only the JSON response, no additional text.
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(contract=contract_text[:8000])  # Limit input size
        
        try:
            analysis = json.loads(result)
            return analysis
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "summary": "Analysis completed but formatting error occurred",
                "contract_type": "Unknown",
                "key_terms": [],
                "potential_risks": [{"risk": "Unable to parse detailed analysis", "severity": "low", "recommendation": "Manual review recommended"}],
                "missing_clauses": [],
                "compliance_notes": [],
                "negotiation_points": []
            }
    
    async def generate_document(self, template_type: str, parameters: Dict[str, Any]) -> str:
        """Generate legal document from template and parameters"""
        self._check_api_key()
        
        templates = {
            "nda": """
            Create a comprehensive Non-Disclosure Agreement with the following details:
            - Disclosing Party: {disclosing_party}
            - Receiving Party: {receiving_party}
            - Purpose: {purpose}
            - Duration: {duration}
            - Jurisdiction: {jurisdiction}
            
            Include standard NDA clauses for confidentiality, permitted use, return of information, and remedies.
            """,
            
            "service_agreement": """
            Create a Service Agreement with the following details:
            - Service Provider: {provider}
            - Client: {client}
            - Services Description: {services}
            - Payment Terms: {payment_terms}
            - Duration: {duration}
            - Jurisdiction: {jurisdiction}
            
            Include clauses for scope of work, payment, intellectual property, termination, and liability.
            """,
            
            "employment_contract": """
            Create an Employment Contract with the following details:
            - Employer: {employer}
            - Employee: {employee}
            - Position: {position}
            - Start Date: {start_date}
            - Salary: {salary}
            - Benefits: {benefits}
            - Jurisdiction: {jurisdiction}
            
            Include standard employment clauses for duties, compensation, confidentiality, and termination.
            """
        }
        
        if template_type not in templates:
            raise ValueError(f"Unknown template type: {template_type}")
        
        template_text = templates[template_type]
        
        prompt = PromptTemplate(
            input_variables=list(parameters.keys()),
            template=f"""
            {template_text}
            
            Create a professional, legally sound document. Use proper legal language and formatting.
            Include all necessary standard clauses for this type of agreement.
            Ensure the document is comprehensive and ready for legal review.
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(**parameters)
        
        return result
    
    async def extract_document_summary(self, document_text: str) -> Dict[str, Any]:
        """Extract key information and create summary of uploaded document"""
        self._check_api_key()
        
        prompt = PromptTemplate(
            input_variables=["document"],
            template="""
            Analyze the following legal document and extract key information:

            Document:
            {document}

            Provide analysis in JSON format:
            {{
                "document_type": "Type of document",
                "summary": "Brief summary",
                "key_parties": ["List of parties involved"],
                "important_dates": ["List of important dates"],
                "key_obligations": ["List of key obligations"],
                "financial_terms": ["Any financial terms or amounts"],
                "risks_identified": ["Potential legal risks or issues"]
            }}
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(document=document_text[:6000])
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {
                "document_type": "Unknown",
                "summary": "Document processed but analysis formatting failed",
                "key_parties": [],
                "important_dates": [],
                "key_obligations": [],
                "financial_terms": [],
                "risks_identified": []
            }
    
    async def legal_research(self, query: str) -> str:
        """Perform legal research and provide insights"""
        self._check_api_key()
        
        prompt = PromptTemplate(
            input_variables=["query"],
            template="""
            Provide legal research insights for the following query:
            
            Query: {query}
            
            Please provide:
            1. Overview of relevant legal principles
            2. Key considerations
            3. Potential legal issues
            4. Recommended next steps
            5. Important disclaimers
            
            Note: This is for informational purposes only and should not be considered legal advice.
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(query=query)
        
        return result

# Global instance
ai_service = AIService()