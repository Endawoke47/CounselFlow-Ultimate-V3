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
        analysis_type: str = "risk_assessment",
        use_consensus: bool = False
    ) -> Dict[str, Any]:
        """Analyze contract using AI with optional multi-provider consensus"""
        
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
            """,
            
            "legal_strategy": f"""
            Analyze this contract from a strategic legal perspective:
            
            Contract Text:
            {contract_text}
            
            Provide analysis on:
            1. Negotiation advantages and weaknesses
            2. Market standard deviations
            3. Precedent and case law implications
            4. Alternative clause suggestions
            5. Risk mitigation strategies
            
            Format as JSON with structured recommendations.
            """
        }
        
        prompt = prompts.get(analysis_type, prompts["risk_assessment"])
        
        try:
            if use_consensus and len(self.providers) >= 2:
                return await self._analyze_with_consensus(prompt, analysis_type)
            else:
                # Single provider analysis with fallback
                providers_to_try = [AIProvider.OPENAI, AIProvider.ANTHROPIC, AIProvider.GOOGLE]
                
                for provider in providers_to_try:
                    if provider in self.providers:
                        try:
                            response = await self.generate_text(
                                prompt=prompt,
                                provider=provider,
                                temperature=0.1
                            )
                            
                            # Try to parse JSON response
                            try:
                                analysis_result = json.loads(response.content)
                                analysis_result["_metadata"] = {
                                    "provider": provider.value,
                                    "model": response.model,
                                    "processing_time": response.processing_time,
                                    "tokens_used": response.tokens_used,
                                    "consensus": False
                                }
                                return analysis_result
                            except json.JSONDecodeError:
                                return {
                                    "analysis": response.content,
                                    "analysis_type": analysis_type,
                                    "_metadata": {
                                        "provider": provider.value,
                                        "model": response.model,
                                        "processing_time": response.processing_time,
                                        "tokens_used": response.tokens_used,
                                        "consensus": False
                                    }
                                }
                        
                        except Exception as e:
                            logger.warning(f"Contract analysis failed with {provider}", error=str(e))
                            continue
                
                raise RuntimeError("All AI providers failed for contract analysis")
            
        except Exception as e:
            logger.error("Contract analysis failed", error=str(e))
            raise
    
    async def _analyze_with_consensus(
        self,
        prompt: str,
        analysis_type: str
    ) -> Dict[str, Any]:
        """Perform consensus analysis using multiple AI providers"""
        
        available_providers = list(self.providers.keys())
        if len(available_providers) < 2:
            raise ValueError("Consensus analysis requires at least 2 providers")
        
        responses = []
        tasks = []
        
        # Run analysis on all available providers concurrently
        for provider in available_providers:
            task = self.generate_text(
                prompt=prompt,
                provider=provider,
                temperature=0.1
            )
            tasks.append((provider, task))
        
        # Collect all responses
        for provider, task in tasks:
            try:
                response = await task
                try:
                    parsed_content = json.loads(response.content)
                    responses.append({
                        "provider": provider.value,
                        "content": parsed_content,
                        "raw_response": response
                    })
                except json.JSONDecodeError:
                    responses.append({
                        "provider": provider.value,
                        "content": {"analysis": response.content},
                        "raw_response": response
                    })
            except Exception as e:
                logger.warning(f"Consensus analysis failed for {provider}", error=str(e))
                continue
        
        if not responses:
            raise RuntimeError("No providers succeeded in consensus analysis")
        
        # Generate consensus result
        consensus_result = await self._generate_consensus(responses, analysis_type)
        
        # Add metadata
        consensus_result["_metadata"] = {
            "consensus": True,
            "providers_used": [r["provider"] for r in responses],
            "total_providers": len(responses),
            "analysis_type": analysis_type,
            "total_tokens": sum(r["raw_response"].tokens_used or 0 for r in responses),
            "avg_processing_time": sum(r["raw_response"].processing_time or 0 for r in responses) / len(responses)
        }
        
        return consensus_result
    
    async def _generate_consensus(
        self,
        responses: List[Dict[str, Any]],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Generate consensus from multiple AI responses"""
        
        if analysis_type == "risk_assessment":
            return await self._consensus_risk_assessment(responses)
        elif analysis_type == "clause_extraction":
            return await self._consensus_clause_extraction(responses)
        elif analysis_type == "compliance_check":
            return await self._consensus_compliance_check(responses)
        else:
            # Generic consensus for other types
            return await self._generic_consensus(responses)
    
    async def _consensus_risk_assessment(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate consensus for risk assessment"""
        
        risk_scores = []
        all_risk_areas = []
        all_recommendations = []
        all_critical_clauses = []
        all_missing_provisions = []
        
        for response in responses:
            content = response["content"]
            if isinstance(content, dict):
                if "risk_score" in content:
                    try:
                        risk_scores.append(float(content["risk_score"]))
                    except (ValueError, TypeError):
                        pass
                
                if "risk_areas" in content and isinstance(content["risk_areas"], list):
                    all_risk_areas.extend(content["risk_areas"])
                
                if "recommendations" in content and isinstance(content["recommendations"], list):
                    all_recommendations.extend(content["recommendations"])
                
                if "critical_clauses" in content and isinstance(content["critical_clauses"], list):
                    all_critical_clauses.extend(content["critical_clauses"])
                
                if "missing_provisions" in content and isinstance(content["missing_provisions"], list):
                    all_missing_provisions.extend(content["missing_provisions"])
        
        # Calculate consensus risk score (average)
        consensus_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 5.0
        
        # Remove duplicates and rank by frequency
        def rank_by_frequency(items):
            from collections import Counter
            if not items:
                return []
            counter = Counter(items)
            return [item for item, count in counter.most_common()]
        
        return {
            "risk_score": round(consensus_risk_score, 1),
            "risk_areas": rank_by_frequency(all_risk_areas)[:10],  # Top 10
            "recommendations": rank_by_frequency(all_recommendations)[:10],
            "critical_clauses": rank_by_frequency(all_critical_clauses)[:10],
            "missing_provisions": rank_by_frequency(all_missing_provisions)[:10],
            "confidence_score": len(responses) / 3.0 * 100,  # Higher with more providers
            "provider_agreement": {
                "risk_score_variance": max(risk_scores) - min(risk_scores) if len(risk_scores) > 1 else 0,
                "provider_count": len(responses)
            }
        }
    
    async def _consensus_clause_extraction(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate consensus for clause extraction"""
        
        clause_types = ["payment_terms", "termination_clauses", "liability_limitations", 
                       "intellectual_property_clauses", "confidentiality_provisions", "governing_law"]
        
        consensus_clauses = {}
        
        for clause_type in clause_types:
            extracted_clauses = []
            for response in responses:
                content = response["content"]
                if isinstance(content, dict) and clause_type in content:
                    if content[clause_type]:
                        extracted_clauses.append(content[clause_type])
            
            if extracted_clauses:
                # Use the most common extraction or the longest one
                consensus_clauses[clause_type] = max(extracted_clauses, key=len)
            else:
                consensus_clauses[clause_type] = "Not found"
        
        return {
            **consensus_clauses,
            "extraction_confidence": len(responses) / 3.0 * 100,
            "clauses_found": sum(1 for v in consensus_clauses.values() if v != "Not found")
        }
    
    async def _consensus_compliance_check(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate consensus for compliance check"""
        
        compliance_scores = []
        all_issues = []
        
        for response in responses:
            content = response["content"]
            if isinstance(content, dict):
                if "compliance_score" in content:
                    try:
                        compliance_scores.append(float(content["compliance_score"]))
                    except (ValueError, TypeError):
                        pass
                
                if "issues" in content and isinstance(content["issues"], list):
                    all_issues.extend(content["issues"])
        
        consensus_score = sum(compliance_scores) / len(compliance_scores) if compliance_scores else 5.0
        
        from collections import Counter
        issue_counter = Counter(all_issues)
        ranked_issues = [issue for issue, count in issue_counter.most_common(10)]
        
        return {
            "compliance_score": round(consensus_score, 1),
            "issues": ranked_issues,
            "compliance_level": "High" if consensus_score >= 8 else "Medium" if consensus_score >= 6 else "Low",
            "confidence": len(responses) / 3.0 * 100
        }
    
    async def _generic_consensus(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate generic consensus for unstructured responses"""
        
        # Combine all text responses
        combined_analysis = "\n\n".join([
            f"Provider {resp['provider']}:\n{resp['content'].get('analysis', str(resp['content']))}"
            for resp in responses
        ])
        
        # Use the primary provider to synthesize consensus
        if self.providers:
            primary_provider = list(self.providers.keys())[0]
            synthesis_prompt = f"""
            Based on the following multiple AI analysis results, provide a synthesized consensus:
            
            {combined_analysis}
            
            Please provide a unified analysis that incorporates the best insights from all providers.
            Highlight areas of agreement and note any significant disagreements.
            """
            
            try:
                synthesis_response = await self.generate_text(
                    prompt=synthesis_prompt,
                    provider=primary_provider,
                    temperature=0.2
                )
                
                return {
                    "consensus_analysis": synthesis_response.content,
                    "individual_responses": responses,
                    "synthesis_quality": "AI-generated"
                }
            except Exception as e:
                logger.warning("Failed to generate synthesis", error=str(e))
        
        return {
            "consensus_analysis": combined_analysis,
            "individual_responses": responses,
            "synthesis_quality": "Simple concatenation"
        }
    
    async def generate_document(
        self,
        document_type: str,
        parameters: Dict[str, Any],
        use_consensus: bool = False
    ) -> Dict[str, Any]:
        """Generate legal document using AI with optional consensus"""
        
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
            """,
            
            "employment_agreement": """
            Generate an Employment Agreement with these parameters:
            {parameters}
            
            Include:
            - Job description and responsibilities
            - Compensation and benefits
            - Confidentiality and non-compete clauses
            - Termination procedures
            - Intellectual property assignment
            """,
            
            "license_agreement": """
            Generate a Software License Agreement with these parameters:
            {parameters}
            
            Include:
            - License grant and scope
            - Usage restrictions
            - Support and maintenance terms
            - Liability limitations
            - Termination conditions
            """,
            
            "partnership_agreement": """
            Generate a Partnership Agreement with these parameters:
            {parameters}
            
            Include:
            - Partnership structure and governance
            - Capital contributions and profit sharing
            - Management responsibilities
            - Dispute resolution procedures
            - Exit strategies
            """
        }
        
        if document_type not in document_prompts:
            raise ValueError(f"Unsupported document type: {document_type}")
        
        prompt = document_prompts[document_type].format(parameters=json.dumps(parameters, indent=2))
        
        try:
            if use_consensus and len(self.providers) >= 2:
                # Generate multiple versions and create consensus
                return await self._generate_document_with_consensus(prompt, document_type, parameters)
            else:
                response = await self.generate_text(
                    prompt=prompt,
                    temperature=0.3,
                    max_tokens=4000
                )
                
                return {
                    "document": response.content,
                    "document_type": document_type,
                    "parameters": parameters,
                    "metadata": {
                        "provider": response.provider.value,
                        "model": response.model,
                        "processing_time": response.processing_time,
                        "tokens_used": response.tokens_used,
                        "consensus": False
                    }
                }
            
        except Exception as e:
            logger.error("Document generation failed", document_type=document_type, error=str(e))
            raise
    
    async def _generate_document_with_consensus(
        self,
        prompt: str,
        document_type: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate document with consensus from multiple providers"""
        
        available_providers = list(self.providers.keys())[:2]  # Use top 2 providers for efficiency
        
        documents = []
        for provider in available_providers:
            try:
                response = await self.generate_text(
                    prompt=prompt,
                    provider=provider,
                    temperature=0.3,
                    max_tokens=4000
                )
                documents.append({
                    "provider": provider.value,
                    "content": response.content,
                    "metadata": response
                })
            except Exception as e:
                logger.warning(f"Document generation failed for {provider}", error=str(e))
                continue
        
        if len(documents) < 2:
            # Fallback to single provider
            if documents:
                return {
                    "document": documents[0]["content"],
                    "document_type": document_type,
                    "parameters": parameters,
                    "metadata": {
                        "provider": documents[0]["provider"],
                        "consensus": False,
                        "fallback": True
                    }
                }
            else:
                raise RuntimeError("All providers failed for document generation")
        
        # Create synthesis prompt
        synthesis_prompt = f"""
        I have {len(documents)} versions of a {document_type} generated by different AI providers.
        Please create the best possible version by combining the strengths of each:
        
        Version 1 ({documents[0]['provider']}):
        {documents[0]['content']}
        
        Version 2 ({documents[1]['provider']}):
        {documents[1]['content']}
        
        Create a synthesized version that:
        1. Uses the best legal language from both versions
        2. Includes the most comprehensive clauses
        3. Maintains legal accuracy and consistency
        4. Follows professional formatting standards
        
        Provide only the final synthesized document.
        """
        
        try:
            synthesis_response = await self.generate_text(
                prompt=synthesis_prompt,
                provider=available_providers[0],
                temperature=0.2,
                max_tokens=4000
            )
            
            return {
                "document": synthesis_response.content,
                "document_type": document_type,
                "parameters": parameters,
                "metadata": {
                    "consensus": True,
                    "providers_used": [doc["provider"] for doc in documents],
                    "synthesis_provider": available_providers[0].value,
                    "total_tokens": sum(doc["metadata"].tokens_used or 0 for doc in documents),
                    "processing_time": sum(doc["metadata"].processing_time or 0 for doc in documents)
                },
                "individual_versions": documents
            }
            
        except Exception as e:
            logger.warning("Document synthesis failed", error=str(e))
            # Return the best individual version
            return {
                "document": documents[0]["content"],
                "document_type": document_type,
                "parameters": parameters,
                "metadata": {
                    "provider": documents[0]["provider"],
                    "consensus": False,
                    "synthesis_failed": True
                }
            }
    
    async def research_legal_topic(
        self,
        topic: str,
        jurisdiction: str = "US",
        research_depth: str = "comprehensive"
    ) -> Dict[str, Any]:
        """Conduct legal research on a specific topic"""
        
        research_prompt = f"""
        Conduct comprehensive legal research on the following topic:
        
        Topic: {topic}
        Jurisdiction: {jurisdiction}
        Research Depth: {research_depth}
        
        Please provide:
        1. Legal Framework Overview
        2. Key Statutes and Regulations
        3. Relevant Case Law (with citations)
        4. Current Legal Trends
        5. Practical Implications
        6. Risk Assessment
        7. Recommended Actions
        
        Format as JSON with these sections clearly defined.
        Include citations where applicable and mark any areas of legal uncertainty.
        """
        
        try:
            # Use the most capable provider for research
            preferred_providers = [AIProvider.ANTHROPIC, AIProvider.OPENAI, AIProvider.GOOGLE]
            
            for provider in preferred_providers:
                if provider in self.providers:
                    try:
                        response = await self.generate_text(
                            prompt=research_prompt,
                            provider=provider,
                            temperature=0.1,  # Lower temperature for accuracy
                            max_tokens=4000
                        )
                        
                        try:
                            research_result = json.loads(response.content)
                        except json.JSONDecodeError:
                            research_result = {"research": response.content}
                        
                        research_result["_metadata"] = {
                            "topic": topic,
                            "jurisdiction": jurisdiction,
                            "research_depth": research_depth,
                            "provider": provider.value,
                            "model": response.model,
                            "processing_time": response.processing_time,
                            "tokens_used": response.tokens_used,
                            "disclaimer": "AI-generated research should be verified with legal professionals"
                        }
                        
                        return research_result
                        
                    except Exception as e:
                        logger.warning(f"Legal research failed with {provider}", error=str(e))
                        continue
            
            raise RuntimeError("All providers failed for legal research")
            
        except Exception as e:
            logger.error("Legal research failed", topic=topic, error=str(e))
            raise
    
    async def analyze_litigation_strategy(
        self,
        case_details: Dict[str, Any],
        analysis_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """Analyze litigation strategy and provide recommendations"""
        
        strategy_prompt = f"""
        Analyze the following litigation case and provide strategic recommendations:
        
        Case Details:
        {json.dumps(case_details, indent=2)}
        
        Analysis Type: {analysis_type}
        
        Please provide:
        1. Case Strength Assessment (1-10 scale)
        2. Key Legal Issues
        3. Potential Arguments (for plaintiff/defendant)
        4. Evidence Requirements
        5. Settlement Considerations
        6. Timeline and Milestones
        7. Resource Requirements
        8. Risk Factors
        9. Strategic Recommendations
        10. Alternative Dispute Resolution Options
        
        Format as JSON with detailed analysis for each section.
        Consider both offensive and defensive strategies.
        """
        
        try:
            response = await self.generate_text(
                prompt=strategy_prompt,
                temperature=0.2,
                max_tokens=4000
            )
            
            try:
                strategy_result = json.loads(response.content)
            except json.JSONDecodeError:
                strategy_result = {"strategy_analysis": response.content}
            
            strategy_result["_metadata"] = {
                "case_id": case_details.get("case_id", "unknown"),
                "analysis_type": analysis_type,
                "provider": response.provider.value,
                "model": response.model,
                "processing_time": response.processing_time,
                "tokens_used": response.tokens_used,
                "disclaimer": "Strategic analysis is AI-generated and should be reviewed by qualified legal counsel"
            }
            
            return strategy_result
            
        except Exception as e:
            logger.error("Litigation strategy analysis failed", error=str(e))
            raise
    
    async def generate_legal_memo(
        self,
        memo_request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a legal memorandum"""
        
        memo_prompt = f"""
        Generate a comprehensive legal memorandum with the following requirements:
        
        Memo Request:
        {json.dumps(memo_request, indent=2)}
        
        Structure the memo with:
        1. MEMORANDUM HEADER (To, From, Date, Re)
        2. EXECUTIVE SUMMARY
        3. STATEMENT OF FACTS
        4. LEGAL ANALYSIS
        5. CONCLUSION AND RECOMMENDATIONS
        
        Legal Analysis should include:
        - Applicable law and regulations
        - Case law analysis
        - Legal arguments
        - Risk assessment
        - Alternative approaches
        
        Use proper legal citation format and maintain professional tone throughout.
        """
        
        try:
            response = await self.generate_text(
                prompt=memo_prompt,
                temperature=0.3,
                max_tokens=4000
            )
            
            return {
                "memorandum": response.content,
                "memo_type": memo_request.get("memo_type", "general"),
                "client": memo_request.get("client", "unknown"),
                "metadata": {
                    "provider": response.provider.value,
                    "model": response.model,
                    "processing_time": response.processing_time,
                    "tokens_used": response.tokens_used,
                    "generated_date": asyncio.get_event_loop().time(),
                    "disclaimer": "This memorandum is AI-generated and requires review by qualified legal counsel"
                }
            }
            
        except Exception as e:
            logger.error("Legal memo generation failed", error=str(e))
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