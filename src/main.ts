import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsClientAdapter } from './ws-client.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsClientAdapter(app));
  await app.listen(3030);
}
bootstrap();
