import { Injectable, NestMiddleware } from '@nestjs/common';
import * as bodyParser from 'body-parser';

const bodyParserXML = bodyParser.text({
  type: 'application/xml',
});

@Injectable()
export class XMLMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    bodyParserXML(req, res, next);
  }
}
