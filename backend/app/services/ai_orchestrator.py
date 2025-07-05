"""
CounselFlow Ultimate V3 - AI Orchestrator Service
Multi-LLM AI integration service for legal workflows
"""

import asyncio
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import structlog
from dataclasses import dataclass
import json

from app.core.config import settings, Constants

logger = structlog.get_logger()


class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"


@dataclass
class AIResponse:
    content: str
    provider: AIProvider
    model: str
    tokens_used: Optional[int] = None
    cost: Optional[float] = None
    processing_time: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class AIOrchestrator:
    """Orchestrator for multiple AI providers"""
    
    def __init__(self):
        self.providers = {}
        self.default_provider = AIProvider.OPENAI
        self.is_initialized = False
        
    async def initialize(self) -> None:
        """Initialize AI providers"""
        try:
            # Initialize OpenAI
            if settings.OPENAI_API_KEY:
                try:
                    import openai
                    openai.api_key = settings.OPENAI_API_KEY
                    self.providers[AIProvider.OPENAI] = openai
                    logger.info("OpenAI client initialized")
                except ImportError:
                    logger.warning("OpenAI library not available")
                except Exception as e:
                    logger.error("Failed to initialize OpenAI", error=str(e))
            
            # Initialize Anthropic
            if settings.ANTHROPIC_API_KEY:
                try:
                    import anthropic
                    self.providers[AIProvider.ANTHROPIC] = anthropic.Anthropic(
                        api_key=settings.ANTHROPIC_API_KEY
                    )
                    logger.info("Anthropic client initialized")
                except ImportError:
                    logger.warning("Anthropic library not available")
                except Exception as e:
                    logger.error("Failed to initialize Anthropic", error=str(e))
            
            # Initialize Google AI
            if settings.GOOGLE_API_KEY:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=settings.GOOGLE_API_KEY)
                    self.providers[AIProvider.GOOGLE] = genai
                    logger.info("Google AI client initialized")
                except ImportError:
                    logger.warning("Google AI library not available")
                except Exception as e:
                    logger.error("Failed to initialize Google AI", error=str(e))
            
            self.is_initialized = True
            logger.info("AI Orchestrator initialized", providers=list(self.providers.keys()))
            
        except Exception as e:
            logger.error("Failed to initialize AI Orchestrator", error=str(e))
            raise
    
    async def generate_text(
        self,
        prompt: str,
        provider: Optional[AIProvider] = None,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> AIResponse:
        """Generate text using specified AI provider"""
        
        if not self.is_initialized:
            await self.initialize()
        
        provider = provider or self.default_provider
        max_tokens = max_tokens or settings.AI_MAX_TOKENS
        temperature = temperature or settings.AI_TEMPERATURE
        
        if provider not in self.providers:
            raise ValueError(f"Provider {provider} not available")
        
        try:
            start_time = asyncio.get_event_loop().time()
            
            if provider == AIProvider.OPENAI:
                response = await self._generate_openai(prompt, model, max_tokens, temperature)
            elif provider == AIProvider.ANTHROPIC:
                response = await self._generate_anthropic(prompt, model, max_tokens, temperature)
            elif provider == AIProvider.GOOGLE:
                response = await self._generate_google(prompt, model, max_tokens, temperature)
            else:
                raise ValueError(f"Unsupported provider: {provider}")
            
            processing_time = asyncio.get_event_loop().time() - start_time
            response.processing_time = processing_time
            
            logger.info(
                "AI text generated",
                provider=provider,
                model=response.model,
                tokens_used=response.tokens_used,
                processing_time=processing_time
            )
            
            return response
            
        except Exception as e:
            logger.error("Failed to generate text", provider=provider, error=str(e))
            raise
    
    async def _generate_openai(
        self,
        prompt: str,
        model: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> AIResponse:
        """Generate text using OpenAI"""
        import openai
        
        model = model or Constants.DEFAULT_MODELS["openai"]
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature,
                timeout=settings.AI_REQUEST_TIMEOUT
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return AIResponse(
                content=content,
                provider=AIProvider.OPENAI,
                model=model,
                tokens_used=tokens_used,
                metadata={
                    "finish_reason": response.choices[0].finish_reason,
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens
                }
            )
            
        except Exception as e:
            logger.error("OpenAI generation failed", error=str(e))
            raise
    
    async def _generate_anthropic(
        self,
        prompt: str,
        model: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> AIResponse:
        """Generate text using Anthropic Claude"""
        
        model = model or Constants.DEFAULT_MODELS["anthropic"]
        client = self.providers[AIProvider.ANTHROPIC]
        
        try:
            response = await client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            
            return AIResponse(
                content=content,
                provider=AIProvider.ANTHROPIC,
                model=model,
                tokens_used=tokens_used,
                metadata={
                    "stop_reason": response.stop_reason,
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                }
            )
            
        except Exception as e:
            logger.error("Anthropic generation failed", error=str(e))
            raise
    
    async def _generate_google(
        self,
        prompt: str,
        model: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> AIResponse:
        """Generate text using Google AI"""
        
        model_name = model or Constants.DEFAULT_MODELS["google"]
        genai = self.providers[AIProvider.GOOGLE]
        
        try:
            model = genai.GenerativeModel(model_name)
            
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature
            )
            
            response = await model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            
            content = response.text
            
            return AIResponse(
                content=content,
                provider=AIProvider.GOOGLE,
                model=model_name,
                tokens_used=None,  # Google doesn't provide token count in response
                metadata={
                    "finish_reason": response.candidates[0].finish_reason if response.candidates else None,
                    "safety_ratings": response.candidates[0].safety_ratings if response.candidates else None
                }
            )
            
        except Exception as e:
            logger.error("Google AI generation failed", error=str(e))
            raise
    
    async def analyze_contract(
        self,
        contract_text: str,
        analysis_type: str = "risk_assessment"
    ) -> Dict[str, Any]:
        """Analyze contract using AI"""
        
        prompts = {
            "risk_assessment": f"""
            Analyze the following contract for legal risks and provide a structured assessment:
            
            Contract Text:
            {contract_text}
            
            Please provide:
            1. Risk Score (1-10, where 10 is highest risk)
            2. Key Risk Areas (list of specific concerns)
            3. Recommendations (actionable suggestions)
            4. Critical Clauses (problematic sections)
            5. Missing Provisions (standard clauses that should be added)
            
            Format your response as JSON with these exact keys:
            risk_score, risk_areas, recommendations, critical_clauses, missing_provisions
            """,
            
            "clause_extraction": f"""
            Extract and categorize key clauses from this contract:
            
            Contract Text:
            {contract_text}
            
            Identify and extract:
            1. Payment Terms
            2. Termination Clauses
            3. Liability Limitations
            4. Intellectual Property Clauses
            5. Confidentiality Provisions
            6. Governing Law
            
            Format as JSON with clause_type as keys and extracted text as values.
            """,
            
            "compliance_check": f"""
            Review this contract for compliance with common legal standards:
            
            Contract Text:
            {contract_text}
            
            Check for compliance with:
            1. GDPR (if applicable)
            2. Industry-specific regulations
            3. Standard legal requirements
            4. Best practices
            
            Provide compliance score (1-10) and specific issues found.
            """
        }
        
        prompt = prompts.get(analysis_type, prompts["risk_assessment"])
        
        try:
            # Try multiple providers for redundancy
            providers_to_try = [AIProvider.OPENAI, AIProvider.ANTHROPIC, AIProvider.GOOGLE]
            
            for provider in providers_to_try:
                if provider in self.providers:
                    try:
                        response = await self.generate_text(
                            prompt=prompt,
                            provider=provider,
                            temperature=0.1  # Lower temperature for analytical tasks
                        )
                        
                        # Try to parse JSON response
                        try:
                            analysis_result = json.loads(response.content)
                            analysis_result["_metadata"] = {
                                "provider": provider.value,
                                "model": response.model,
                                "processing_time": response.processing_time,
                                "tokens_used": response.tokens_used
                            }
                            return analysis_result
                        except json.JSONDecodeError:
                            # If JSON parsing fails, return structured response
                            return {
                                "analysis": response.content,
                                "analysis_type": analysis_type,
                                "_metadata": {
                                    "provider": provider.value,
                                    "model": response.model,
                                    "processing_time": response.processing_time,
                                    "tokens_used": response.tokens_used
                                }
                            }
                    
                    except Exception as e:
                        logger.warning(f"Contract analysis failed with {provider}", error=str(e))
                        continue
            
            raise RuntimeError("All AI providers failed for contract analysis")
            
        except Exception as e:
            logger.error("Contract analysis failed", error=str(e))
            raise
    
    async def generate_document(
        self,
        document_type: str,
        parameters: Dict[str, Any]
    ) -> str:
        """Generate legal document using AI"""
        
        document_prompts = {
            "nda": """
            Generate a Non-Disclosure Agreement with the following parameters:
            {parameters}
            
            Include standard NDA clauses:
            - Definition of confidential information
            - Obligations of receiving party
            - Permitted disclosures
            - Term and termination
            - Remedies for breach
            
            Make it legally sound and professionally formatted.
            """,
            
            "service_agreement": """
            Generate a Service Agreement with these parameters:
            {parameters}
            
            Include:
            - Scope of services
            - Payment terms
            - Deliverables and timelines
            - Intellectual property rights
            - Limitation of liability
            - Termination provisions
            """,
            
            "privacy_policy": """
            Generate a Privacy Policy with these parameters:
            {parameters}
            
            Ensure compliance with:
            - GDPR requirements
            - CCPA requirements
            - General privacy best practices
            
            Include all necessary sections for data collection, use, and protection.
            """
        }
        
        if document_type not in document_prompts:
            raise ValueError(f"Unsupported document type: {document_type}")
        
        prompt = document_prompts[document_type].format(parameters=json.dumps(parameters, indent=2))
        
        try:
            response = await self.generate_text(
                prompt=prompt,
                temperature=0.3,  # Moderate creativity for document generation
                max_tokens=4000   # Longer documents need more tokens
            )
            
            return response.content
            
        except Exception as e:
            logger.error("Document generation failed", document_type=document_type, error=str(e))
            raise
    
    def get_available_providers(self) -> List[AIProvider]:
        """Get list of available AI providers"""
        return list(self.providers.keys())
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Get status of all AI providers"""
        return {
            provider.value: {
                "available": provider in self.providers,
                "configured": getattr(settings, f"{provider.value.upper()}_API_KEY") is not None
            }
            for provider in AIProvider
        }


# Global AI orchestrator instance
ai_orchestrator = AIOrchestrator()


async def check_ai_health() -> bool:
    """Health check for AI services"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        # Test with a simple prompt
        test_prompt = "Hello, this is a test. Please respond with 'AI services are working.'"
        
        # Try at least one provider
        available_providers = ai_orchestrator.get_available_providers()
        if not available_providers:
            return False
        
        try:
            response = await ai_orchestrator.generate_text(
                prompt=test_prompt,
                provider=available_providers[0],
                max_tokens=50
            )
            return "working" in response.content.lower()
        except Exception:
            return False
            
    except Exception as e:
        logger.error("AI health check failed", error=str(e))
        return False