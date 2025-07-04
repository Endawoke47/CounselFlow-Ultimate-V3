import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from '../dto/chat-message.dto';

@Injectable()
export class AIOrchestratorService {
  private readonly logger = new Logger(AIOrchestratorService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async processMessage(chatDto: ChatMessageDto): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/chat`, {
          message: chatDto.message,
          context: chatDto.context,
          userId: chatDto.userId,
        })
        .toPromise();

      return {
        success: true,
        response: response.data.response,
        suggestions: response.data.suggestions || [],
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('AI chat processing failed:', error.message);
      return {
        success: false,
        error: 'AI service temporarily unavailable',
        fallbackResponse: 'I apologize, but I cannot process your request at the moment. Please try again later.',
      };
    }
  }

  async getCapabilities(): Promise<any> {
    return {
      features: [
        'Legal Research & Analysis',
        'Contract Review & Analysis',
        'Document Generation',
        'Risk Assessment',
        'Compliance Checking',
        'Case Law Search',
        'Legal Q&A',
      ],
      models: [
        { name: 'GPT-4', purpose: 'General legal reasoning' },
        { name: 'Claude-3', purpose: 'Document analysis' },
        { name: 'Legal-BERT', purpose: 'Case law search' },
      ],
      integrations: [
        'Westlaw',
        'LexisNexis',
        'CourtListener',
        'Google Scholar',
      ],
    };
  }

  async analyzeRisk(content: string, type: string): Promise<any> {
    try {
      const aiEngineUrl = this.configService.get('AI_ENGINE_URL', 'http://localhost:8000');
      
      const response = await this.httpService
        .post(`${aiEngineUrl}/api/v1/risk-analysis`, {
          content,
          type,
        })
        .toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Risk analysis failed:', error.message);
      return {
        success: false,
        error: 'Risk analysis service unavailable',
      };
    }
  }
}