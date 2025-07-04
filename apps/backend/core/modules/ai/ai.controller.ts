import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIOrchestratorService } from './services/ai-orchestrator.service';
import { LegalResearchService } from './services/legal-research.service';
import { ContractAnalysisService } from './services/contract-analysis.service';
import { DocumentGenerationService } from './services/document-generation.service';
import { 
  LegalResearchDto, 
  ContractAnalysisDto, 
  DocumentGenerationDto,
  ChatMessageDto 
} from './dto';

@ApiTags('AI Services')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(
    private readonly aiOrchestrator: AIOrchestratorService,
    private readonly legalResearch: LegalResearchService,
    private readonly contractAnalysis: ContractAnalysisService,
    private readonly documentGeneration: DocumentGenerationService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI Legal Chat Assistant' })
  @ApiResponse({ status: 200, description: 'AI response generated successfully' })
  async chat(@Body() chatDto: ChatMessageDto) {
    return await this.aiOrchestrator.processMessage(chatDto);
  }

  @Post('research')
  @ApiOperation({ summary: 'Legal Research with AI' })
  @ApiResponse({ status: 200, description: 'Legal research completed' })
  async research(@Body() researchDto: LegalResearchDto) {
    return await this.legalResearch.conductResearch(researchDto);
  }

  @Post('analyze-contract')
  @ApiOperation({ summary: 'AI Contract Analysis' })
  @ApiResponse({ status: 200, description: 'Contract analysis completed' })
  async analyzeContract(@Body() analysisDto: ContractAnalysisDto) {
    return await this.contractAnalysis.analyzeContract(analysisDto);
  }

  @Post('generate-document')
  @ApiOperation({ summary: 'AI Document Generation' })
  @ApiResponse({ status: 200, description: 'Document generated successfully' })
  async generateDocument(@Body() generationDto: DocumentGenerationDto) {
    return await this.documentGeneration.generateDocument(generationDto);
  }

  @Get('capabilities')
  @ApiOperation({ summary: 'Get AI Capabilities' })
  @ApiResponse({ status: 200, description: 'AI capabilities retrieved' })
  async getCapabilities() {
    return await this.aiOrchestrator.getCapabilities();
  }
}