import * as amqp from 'amqplib';
import { infra } from 'src/infra/common/ioc';
import { Injectable, Inject } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';

@Injectable()
@WebSocketGateway()
export class MessageBrokerService {
  private channel: amqp.Channel;
  private readonly queueName: string = 'file-upload-progress';

  constructor(
    @Inject(infra.environment.messageBrokerUrl)
    private readonly messageBrokerUrl: string,
  ) {
    this.connect();
  }

  async connect(): Promise<void> {
    const connection = await amqp.connect(this.messageBrokerUrl);
    this.channel = await connection.createChannel();
    await this.channel.assertQueue(this.queueName);
  }

  async sendProgress(fileId: string, progress: number): Promise<void> {
    if (this.channel) {
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify({ fileId, progress })),
      );
    } else {
      throw new Error(
        'Channel not initialized. Ensure connect() method is called before sending messages.',
      );
    }
  }

  async listenToProgress(callback: (data: any) => void): Promise<void> {
    if (this.channel) {
      await this.channel.consume(
        this.queueName,
        (msg) => {
          if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            callback(data);
            this.channel.ack(msg);
          }
        },
        { noAck: false },
      );
    } else {
      throw new Error(
        'Channel not initialized. Ensure connect() method is called before listening.',
      );
    }
  }
}
