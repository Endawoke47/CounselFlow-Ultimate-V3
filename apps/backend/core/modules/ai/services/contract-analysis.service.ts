import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContractAnalysisDto } from '../dto/contract-analysis.dto';

@Injectable()
export class ContractAnalysisService {
  private readonly logger = new Logger(ContractAnalysisService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeContract(analysisDto: ContractAnalysisDto): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/contract-analysis`, {
          content: analysisDto.content,
          contractType: analysisDto.contractType,
          analysisType: analysisDto.analysisType || 'comprehensive',
          focusAreas: analysisDto.focusAreas || [],
        })
        .toPromise();

      return {
        success: true,
        contractType: analysisDto.contractType,
        analysis: {
          summary: response.data.summary,
          keyTerms: response.data.keyTerms || [],
          risks: response.data.risks || [],
          opportunities: response.data.opportunities || [],
          obligations: response.data.obligations || [],
          compliance: response.data.compliance || {},
          recommendations: response.data.recommendations || [],
        },
        riskScore: response.data.riskScore || 0,
        confidenceLevel: response.data.confidenceLevel || 0.9,
        flaggedClauses: response.data.flaggedClauses || [],
        suggestedRevisions: response.data.suggestedRevisions || [],
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Contract analysis failed:', error.message);
      return {
        success: false,
        error: 'Contract analysis service temporarily unavailable',
        fallbackAdvice: 'Please review the contract manually and consult with a legal expert.',
      };
    }
  }

  async extractKeyTerms(content: string): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/extract-terms`, {
          content,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Key terms extraction failed:', error.message);
      return {
        success: false,
        error: 'Terms extraction service unavailable',
      };
    }
  }

  async assessRisk(content: string, contractType: string): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/risk-assessment`, {
          content,
          contractType,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Risk assessment failed:', error.message);
      return {
        success: false,
        error: 'Risk assessment service unavailable',
      };
    }
  }

  async suggestRevisions(content: string, issues: string[]): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/suggest-revisions`, {
          content,
          issues,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Revision suggestions failed:', error.message);
      return {
        success: false,
        error: 'Revision suggestion service unavailable',
      };
    }
  }
}