import { Injectable } from "@nestjs/common";
import { IncomingWebhook } from '@slack/webhook';

@Injectable()
export class SlackService {
    incomingWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
    async sendMessage(message:string) {
        await this.incomingWebhook.send({ text: message });
    }
}
