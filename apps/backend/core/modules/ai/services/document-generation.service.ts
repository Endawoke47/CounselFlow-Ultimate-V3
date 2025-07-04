import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentGenerationDto } from '../dto/document-generation.dto';

@Injectable()
export class DocumentGenerationService {
  private readonly logger = new Logger(DocumentGenerationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateDocument(generationDto: DocumentGenerationDto): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/generate-document`, {
          documentType: generationDto.documentType,
          template: generationDto.template,
          data: generationDto.data,
          options: generationDto.options || {},
          jurisdiction: generationDto.jurisdiction,
        })
        .toPromise();

      return {
        success: true,
        documentType: generationDto.documentType,
        content: response.data.content,
        format: response.data.format || 'markdown',
        metadata: {
          title: response.data.title,
          sections: response.data.sections || [],
          wordCount: response.data.wordCount || 0,
          complexity: response.data.complexity || 'medium',
        },
        suggestions: response.data.suggestions || [],
        alternativeVersions: response.data.alternativeVersions || [],
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Document generation failed:', error.message);
      return {
        success: false,
        error: 'Document generation service temporarily unavailable',
        fallbackTemplate: this.getFallbackTemplate(generationDto.documentType),
      };
    }
  }

  async generateClause(clauseType: string, parameters: any): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/generate-clause`, {
          clauseType,
          parameters,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Clause generation failed:', error.message);
      return {
        success: false,
        error: 'Clause generation service unavailable',
      };
    }
  }

  async improveDraft(content: string, improvementType: string): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/improve-draft`, {
          content,
          improvementType,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Draft improvement failed:', error.message);
      return {
        success: false,
        error: 'Draft improvement service unavailable',
      };
    }
  }

  private getFallbackTemplate(documentType: string): string {
    const fallbackTemplates = {
      'contract': '# Contract Template\n\nThis is a basic contract template. Please customize according to your specific needs.\n\n## Parties\n[Party Information]\n\n## Terms\n[Contract Terms]\n\n## Signatures\n[Signature Block]',
      'letter': '# Legal Letter Template\n\n[Date]\n\n[Recipient Information]\n\nDear [Recipient],\n\n[Letter Content]\n\nSincerely,\n[Sender Information]',
      'memo': '# Legal Memorandum\n\n**TO:** [Recipient]\n**FROM:** [Sender]\n**DATE:** [Date]\n**RE:** [Subject]\n\n## Executive Summary\n[Summary]\n\n## Analysis\n[Legal Analysis]\n\n## Recommendation\n[Recommendations]',
    };

    return fallbackTemplates[documentType] || '# Document Template\n\nPlease customize this template according to your specific requirements.';
  }
}