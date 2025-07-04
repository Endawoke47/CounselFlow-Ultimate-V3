import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LegalResearchDto } from '../dto/legal-research.dto';

@Injectable()
export class LegalResearchService {
  private readonly logger = new Logger(LegalResearchService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async conductResearch(researchDto: LegalResearchDto): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/research`, {
          query: researchDto.query,
          jurisdiction: researchDto.jurisdiction,
          practiceArea: researchDto.practiceArea,
          depth: researchDto.depth || 'standard',
          includeCaseLaw: researchDto.includeCaseLaw !== false,
          includeStatutes: researchDto.includeStatutes !== false,
          includeRegulations: researchDto.includeRegulations !== false,
        })
        .toPromise();

      return {
        success: true,
        query: researchDto.query,
        results: response.data.results,
        summary: response.data.summary,
        caseLaw: response.data.caseLaw || [],
        statutes: response.data.statutes || [],
        regulations: response.data.regulations || [],
        keyFindings: response.data.keyFindings || [],
        recommendations: response.data.recommendations || [],
        confidence: response.data.confidence || 0.85,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Legal research failed:', error.message);
      return {
        success: false,
        error: 'Legal research service temporarily unavailable',
        fallbackSuggestions: [
          'Try rephrasing your research query',
          'Check spelling and legal terminology',
          'Consider broadening your search criteria',
        ],
      };
    }
  }

  async searchCaseLaw(query: string, jurisdiction?: string): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/case-law-search`, {
          query,
          jurisdiction,
          limit: 50,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Case law search failed:', error.message);
      return {
        success: false,
        error: 'Case law search service unavailable',
      };
    }
  }

  async getStatutes(topic: string, jurisdiction: string): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/statutes`, {
          topic,
          jurisdiction,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Statute search failed:', error.message);
      return {
        success: false,
        error: 'Statute search service unavailable',
      };
    }
  }
}