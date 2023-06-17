import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import * as AWS from 'aws-sdk';

import { MessageRepository } from './message.repository';
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  CHATGPT_TOKEN,
} from '@src/constants/EnvKey';

@Injectable()
export class MessageService implements OnModuleInit {
  private signer;
  private openai;

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const access_key = this.configService.get(AWS_ACCESS_KEY_ID) as string;
    const secret_key = this.configService.get(AWS_SECRET_ACCESS_KEY) as string;

    AWS.config.credentials = new AWS.Credentials(
      access_key, // Your access key ID
      secret_key, // Your secret access key
    );

    // Define your service region.
    AWS.config.region = 'ap-south-1';

    const Polly = new AWS.Polly();
    this.signer = new AWS.Polly.Presigner({ service: Polly });

    const configuration = new Configuration({
      apiKey: this.configService.get(CHATGPT_TOKEN),
    });
    this.openai = new OpenAIApi(configuration);
  }

  convertTextToSpeed(GPTResponseMessage: string) {
    return new Promise((resolve, reject) => {
      const input = {
        Engine: 'neural',
        Text: GPTResponseMessage,
        OutputFormat: 'ogg_vorbis',
        VoiceId: 'Amy',
        LanguageCode: 'en-IN',
      };

      this.signer.getSynthesizeSpeechUrl(input, function (err, outputUrl) {
        if (err) {
          reject(err);
        } else {
          resolve(outputUrl);
        }
      });
    });
  }

  async createMessage({ userId, roomId, ...body }) {
    try {
      await this.messageRepository.save({
        userId,
        roomId,
        role: 'user',
        ...body,
      });

      const messages = await this.getListMessage({ userId, roomId });

      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        max_tokens: 50,
      });

      const GPTResponseMessage = response.data.choices[0].message.content;

      const [GPTVoice] = await Promise.all([
        this.convertTextToSpeed(GPTResponseMessage),
        this.messageRepository.save({
          roomId,
          role: 'assistant',
          content: GPTResponseMessage,
        }),
      ]);

      return {
        message: GPTResponseMessage,
        voice: GPTVoice,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.TOO_MANY_REQUESTS,
          error: { message: 'Too many request to GPT' },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  getListMessage({ userId, roomId }) {
    return this.messageRepository.find({
      where: {
        roomId,
      },
      select: ['id', 'role', 'content'],
    });
  }
}
