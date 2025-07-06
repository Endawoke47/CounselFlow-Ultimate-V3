"""
CounselFlow Ultimate V3 - AI Orchestrator Service
Multi-LLM AI integration service for legal workflows
"""

import asyncio
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import structlog
from dataclasses import dataclass, field
import json
import time
from datetime import datetime, timedelta
import aiohttp
from contextlib import asynccontextmanager

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
    request_id: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
    cached: bool = False


@dataclass
class CircuitBreakerState:
    failure_count: int = 0
    last_failure_time: Optional[datetime] = None
    state: str = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    failure_threshold: int = 5
    timeout_seconds: int = 60


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, timeout_seconds: int = 60):
        self.states: Dict[AIProvider, CircuitBreakerState] = {
            provider: CircuitBreakerState(failure_threshold=failure_threshold, timeout_seconds=timeout_seconds)
            for provider in AIProvider
        }
        self.logger = structlog.get_logger()
    
    def can_execute(self, provider: AIProvider) -> bool:
        state = self.states[provider]
        
        if state.state == "CLOSED":
            return True
        elif state.state == "OPEN":
            if state.last_failure_time and \
               datetime.utcnow() - state.last_failure_time > timedelta(seconds=state.timeout_seconds):
                state.state = "HALF_OPEN"
                self.logger.info(f"Circuit breaker for {provider} moved to HALF_OPEN")
                return True
            return False
        elif state.state == "HALF_OPEN":
            return True
        return False
    
    def record_success(self, provider: AIProvider):
        state = self.states[provider]
        state.failure_count = 0
        state.state = "CLOSED"
        state.last_failure_time = None
    
    def record_failure(self, provider: AIProvider):
        state = self.states[provider]
        state.failure_count += 1
        state.last_failure_time = datetime.utcnow()
        
        if state.failure_count >= state.failure_threshold:
            state.state = "OPEN"
            self.logger.warning(f"Circuit breaker for {provider} opened due to {state.failure_count} failures")
    
    def get_state(self, provider: AIProvider) -> str:
        return self.states[provider].state


class AIOrchestrator:
    """Enhanced AI Orchestrator with circuit breaker, caching, and error recovery"""
    
    def __init__(self):
        self.providers = {}
        self.default_provider = AIProvider.OPENAI
        self.is_initialized = False
        self.circuit_breaker = CircuitBreaker()
        self.response_cache: Dict[str, AIResponse] = {}
        self.cache_ttl = 300  # 5 minutes
        self.health_status: Dict[AIProvider, bool] = {}
        self.last_health_check: Dict[AIProvider, datetime] = {}
        self.request_count: Dict[AIProvider, int] = {provider: 0 for provider in AIProvider}
        self.error_count: Dict[AIProvider, int] = {provider: 0 for provider in AIProvider}
        
    async def initialize(self) -> None:
        """Initialize AI providers"""
        try:
            # Initialize OpenAI with modern client
            if settings.OPENAI_API_KEY:
                try:
                    from openai import AsyncOpenAI
                    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                    
                    # Test the connection
                    await self._test_openai_connection(client)
                    
                    self.providers[AIProvider.OPENAI] = client
                    self.health_status[AIProvider.OPENAI] = True
                    self.last_health_check[AIProvider.OPENAI] = datetime.utcnow()
                    logger.info("OpenAI client initialized and tested")
                except ImportError:
                    logger.warning("OpenAI library not available")
                    self.health_status[AIProvider.OPENAI] = False
                except Exception as e:
                    logger.error("Failed to initialize OpenAI", error=str(e))
                    self.health_status[AIProvider.OPENAI] = False
            
            # Initialize Anthropic
            if settings.ANTHROPIC_API_KEY:
                try:
                    import anthropic
                    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
                    
                    # Test the connection
                    await self._test_anthropic_connection(client)
                    
                    self.providers[AIProvider.ANTHROPIC] = client
                    self.health_status[AIProvider.ANTHROPIC] = True
                    self.last_health_check[AIProvider.ANTHROPIC] = datetime.utcnow()
                    logger.info("Anthropic client initialized and tested")
                except ImportError:
                    logger.warning("Anthropic library not available")
                    self.health_status[AIProvider.ANTHROPIC] = False
                except Exception as e:
                    logger.error("Failed to initialize Anthropic", error=str(e))
                    self.health_status[AIProvider.ANTHROPIC] = False
            
            # Initialize Google AI
            if settings.GOOGLE_API_KEY:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=settings.GOOGLE_API_KEY)
                    
                    # Test the connection
                    await self._test_google_connection(genai)
                    
                    self.providers[AIProvider.GOOGLE] = genai
                    self.health_status[AIProvider.GOOGLE] = True
                    self.last_health_check[AIProvider.GOOGLE] = datetime.utcnow()
                    logger.info("Google AI client initialized and tested")
                except ImportError:
                    logger.warning("Google AI library not available")
                    self.health_status[AIProvider.GOOGLE] = False
                except Exception as e:
                    logger.error("Failed to initialize Google AI", error=str(e))
                    self.health_status[AIProvider.GOOGLE] = False
            
            self.is_initialized = True
            healthy_providers = [p for p, status in self.health_status.items() if status]
            logger.info(
                "AI Orchestrator initialized", 
                providers=list(self.providers.keys()),
                healthy_providers=healthy_providers,
                total_providers=len(self.providers)
            )
            
            # Set default provider to first healthy one if current default is unhealthy
            if self.default_provider not in healthy_providers and healthy_providers:
                old_default = self.default_provider
                self.default_provider = healthy_providers[0]
                logger.info(f"Default provider changed from {old_default} to {self.default_provider}")
            
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
        context: Optional[Dict[str, Any]] = None,
        use_cache: bool = True,
        retry_count: int = 3
    ) -> AIResponse:
        """Generate text using specified AI provider with enhanced error handling"""
        
        if not self.is_initialized:
            await self.initialize()
        
        # Input sanitization
        prompt = self._sanitize_prompt(prompt)
        
        provider = provider or self.default_provider
        max_tokens = max_tokens or settings.AI_MAX_TOKENS
        temperature = temperature or settings.AI_TEMPERATURE
        
        # Check cache first
        if use_cache:
            cache_key = self._generate_cache_key(prompt, provider, model, max_tokens, temperature)
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                cached_response.cached = True
                logger.info("Returning cached response", provider=provider, cache_key=cache_key[:16])
                return cached_response
        
        # Find available provider with fallback
        available_provider = self._get_available_provider(provider)
        if not available_provider:
            raise RuntimeError("No AI providers available")
        
        # Execute with retry logic
        last_exception = None
        for attempt in range(retry_count):
            try:
                # Check circuit breaker
                if not self.circuit_breaker.can_execute(available_provider):
                    if attempt < retry_count - 1:
                        available_provider = self._get_fallback_provider(available_provider)
                        if not available_provider:
                            raise RuntimeError("All AI providers unavailable")
                        continue
                    else:
                        raise RuntimeError(f"Circuit breaker open for {available_provider}")
                
                start_time = time.time()
                self.request_count[available_provider] += 1
                
                # Generate with specific provider
                if available_provider == AIProvider.OPENAI:
                    response = await self._generate_openai(prompt, model, max_tokens, temperature)
                elif available_provider == AIProvider.ANTHROPIC:
                    response = await self._generate_anthropic(prompt, model, max_tokens, temperature)
                elif available_provider == AIProvider.GOOGLE:
                    response = await self._generate_google(prompt, model, max_tokens, temperature)
                else:
                    raise ValueError(f"Unsupported provider: {available_provider}")
                
                processing_time = time.time() - start_time
                response.processing_time = processing_time
                
                # Record success
                self.circuit_breaker.record_success(available_provider)
                
                # Cache response
                if use_cache:
                    self._cache_response(cache_key, response)
                
                logger.info(
                    "AI text generated successfully",
                    provider=available_provider,
                    model=response.model,
                    tokens_used=response.tokens_used,
                    processing_time=processing_time,
                    attempt=attempt + 1
                )
                
                return response
                
            except Exception as e:
                last_exception = e
                self.error_count[available_provider] += 1
                self.circuit_breaker.record_failure(available_provider)
                
                logger.warning(
                    "AI generation attempt failed",
                    provider=available_provider,
                    attempt=attempt + 1,
                    error=str(e)
                )
                
                if attempt < retry_count - 1:
                    # Try fallback provider
                    fallback_provider = self._get_fallback_provider(available_provider)
                    if fallback_provider:
                        available_provider = fallback_provider
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    else:
                        await asyncio.sleep(1)  # Brief delay before retry
                
        # All attempts failed
        logger.error("All AI generation attempts failed", provider=provider, final_error=str(last_exception))
        raise last_exception or RuntimeError("AI generation failed after all retries")
    
    async def _generate_openai(
        self,
        prompt: str,
        model: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> AIResponse:
        """Generate text using OpenAI with modern client"""
        
        model = model or Constants.DEFAULT_MODELS["openai"]
        client = self.providers[AIProvider.OPENAI]
        
        try:
            response = await client.chat.completions.create(
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
                request_id=response.id,
                metadata={
                    "finish_reason": response.choices[0].finish_reason,
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "system_fingerprint": getattr(response, 'system_fingerprint', None)
                }
            )
            
        except Exception as e:
            logger.error("OpenAI generation failed", error=str(e), model=model)
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
    
    # =============================================================================
    # CONNECTION TESTING METHODS
    # =============================================================================
    
    async def _test_openai_connection(self, client) -> bool:
        """Test OpenAI connection with a simple request"""
        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=1,
                timeout=10
            )
            return bool(response.choices)
        except Exception as e:
            logger.warning("OpenAI connection test failed", error=str(e))
            return False
    
    async def _test_anthropic_connection(self, client) -> bool:
        """Test Anthropic connection with a simple request"""
        try:
            response = await client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1,
                messages=[{"role": "user", "content": "Test"}]
            )
            return bool(response.content)
        except Exception as e:
            logger.warning("Anthropic connection test failed", error=str(e))
            return False
    
    async def _test_google_connection(self, genai) -> bool:
        """Test Google AI connection with a simple request"""
        try:
            model = genai.GenerativeModel("gemini-pro")
            response = await model.generate_content_async("Test")
            return bool(response.text)
        except Exception as e:
            logger.warning("Google AI connection test failed", error=str(e))
            return False
    
    # =============================================================================
    # HELPER METHODS
    # =============================================================================
    
    def _sanitize_prompt(self, prompt: str) -> str:
        """Sanitize input prompt to prevent injection attacks"""
        if not prompt or not isinstance(prompt, str):
            raise ValueError("Prompt must be a non-empty string")
        
        # Remove potentially dangerous patterns
        dangerous_patterns = [
            "<!--", "-->", "<script>", "</script>", 
            "javascript:", "data:", "vbscript:",
            "eval(", "exec(", "Function(",
        ]
        
        sanitized = prompt
        for pattern in dangerous_patterns:
            sanitized = sanitized.replace(pattern, "")
        
        # Limit length
        max_length = 50000  # Reasonable limit for prompts
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
            logger.warning("Prompt truncated due to length", original_length=len(prompt), truncated_length=len(sanitized))
        
        return sanitized.strip()
    
    def _generate_cache_key(self, prompt: str, provider: AIProvider, model: Optional[str], 
                           max_tokens: int, temperature: float) -> str:
        """Generate cache key for response caching"""
        import hashlib
        
        key_data = f"{prompt}|{provider}|{model}|{max_tokens}|{temperature}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[AIResponse]:
        """Get cached response if still valid"""
        if cache_key in self.response_cache:
            response = self.response_cache[cache_key]
            # Check if cache is still valid
            if (datetime.utcnow() - response.timestamp).total_seconds() < self.cache_ttl:
                return response
            else:
                # Remove expired cache entry
                del self.response_cache[cache_key]
        return None
    
    def _cache_response(self, cache_key: str, response: AIResponse):
        """Cache response for future use"""
        # Limit cache size
        if len(self.response_cache) > 1000:
            # Remove oldest entries
            sorted_cache = sorted(
                self.response_cache.items(),
                key=lambda x: x[1].timestamp
            )
            for old_key, _ in sorted_cache[:100]:  # Remove oldest 100 entries
                del self.response_cache[old_key]
        
        self.response_cache[cache_key] = response
    
    def _get_available_provider(self, preferred_provider: AIProvider) -> Optional[AIProvider]:
        """Get available provider, preferring the specified one"""
        # Check if preferred provider is available and healthy
        if (preferred_provider in self.providers and 
            self.health_status.get(preferred_provider, False) and
            self.circuit_breaker.can_execute(preferred_provider)):
            return preferred_provider
        
        # Find any available provider
        for provider in self.providers:
            if (self.health_status.get(provider, False) and
                self.circuit_breaker.can_execute(provider)):
                return provider
        
        return None
    
    def _get_fallback_provider(self, current_provider: AIProvider) -> Optional[AIProvider]:
        """Get fallback provider when current one fails"""
        # Define fallback order
        fallback_order = {
            AIProvider.OPENAI: [AIProvider.ANTHROPIC, AIProvider.GOOGLE],
            AIProvider.ANTHROPIC: [AIProvider.OPENAI, AIProvider.GOOGLE],
            AIProvider.GOOGLE: [AIProvider.OPENAI, AIProvider.ANTHROPIC]
        }
        
        for fallback in fallback_order.get(current_provider, []):
            if (fallback in self.providers and 
                self.health_status.get(fallback, False) and
                self.circuit_breaker.can_execute(fallback)):
                logger.info(f"Switching from {current_provider} to fallback {fallback}")
                return fallback
        
        return None
    
    # =============================================================================
    # HEALTH CHECK AND MONITORING
    # =============================================================================
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check for all providers"""
        health_results = {}
        overall_healthy = True
        
        for provider in self.providers:
            try:
                start_time = time.time()
                
                # Test simple generation
                test_prompt = "Hello"
                response = await self.generate_text(
                    prompt=test_prompt,
                    provider=provider,
                    max_tokens=1,
                    use_cache=False,
                    retry_count=1
                )
                
                response_time = time.time() - start_time
                
                health_results[provider.value] = {
                    "status": "healthy",
                    "response_time": round(response_time, 3),
                    "last_check": datetime.utcnow().isoformat(),
                    "circuit_breaker_state": self.circuit_breaker.get_state(provider),
                    "request_count": self.request_count[provider],
                    "error_count": self.error_count[provider]
                }
                
                self.health_status[provider] = True
                self.last_health_check[provider] = datetime.utcnow()
                
            except Exception as e:
                overall_healthy = False
                health_results[provider.value] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "last_check": datetime.utcnow().isoformat(),
                    "circuit_breaker_state": self.circuit_breaker.get_state(provider),
                    "request_count": self.request_count[provider],
                    "error_count": self.error_count[provider]
                }
                
                self.health_status[provider] = False
                self.last_health_check[provider] = datetime.utcnow()
        
        return {
            "overall_status": "healthy" if overall_healthy else "degraded",
            "providers": health_results,
            "cache_size": len(self.response_cache),
            "total_requests": sum(self.request_count.values()),
            "total_errors": sum(self.error_count.values()),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get comprehensive metrics for monitoring"""
        metrics = {
            "request_counts": dict(self.request_count),
            "error_counts": dict(self.error_count),
            "error_rates": {},
            "circuit_breaker_states": {},
            "health_status": dict(self.health_status),
            "cache_metrics": {
                "size": len(self.response_cache),
                "ttl_seconds": self.cache_ttl
            },
            "last_health_checks": {
                provider.value: check_time.isoformat() if check_time else None
                for provider, check_time in self.last_health_check.items()
            }
        }
        
        # Calculate error rates
        for provider in AIProvider:
            total_requests = self.request_count[provider]
            if total_requests > 0:
                error_rate = self.error_count[provider] / total_requests
                metrics["error_rates"][provider.value] = round(error_rate, 4)
            else:
                metrics["error_rates"][provider.value] = 0.0
            
            metrics["circuit_breaker_states"][provider.value] = self.circuit_breaker.get_state(provider)
        
        return metrics
    
    async def shutdown(self):
        """Cleanup resources on shutdown"""
        logger.info("Shutting down AI Orchestrator")
        
        # Clear cache
        self.response_cache.clear()
        
        # Close provider connections if needed
        for provider, client in self.providers.items():
            try:
                if hasattr(client, 'close'):
                    await client.close()
                elif hasattr(client, 'aclose'):
                    await client.aclose()
            except Exception as e:
                logger.warning(f"Error closing {provider} client", error=str(e))
        
        self.providers.clear()
        self.is_initialized = False
        
        logger.info("AI Orchestrator shutdown completed")
    
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