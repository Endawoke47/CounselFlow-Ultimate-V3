import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIOrchestratorService } from './services/ai-orchestrator.service';
import { LegalResearchService } from './services/legal-research.service';
import { ContractAnalysisService } from './services/contract-analysis.service';
import { DocumentGenerationService } from './services/document-generation.service';
import { AIController } from './ai.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [AIController],
  providers: [
    AIOrchestratorService,
    LegalResearchService,
    ContractAnalysisService,
    DocumentGenerationService,
  ],
  exports: [
    AIOrchestratorService,
    LegalResearchService,
    ContractAnalysisService,
    DocumentGenerationService,
  ],
})
export class AIModule {}