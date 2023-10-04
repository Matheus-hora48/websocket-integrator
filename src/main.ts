import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CronJob } from 'cron';
import SyncCity from './utils/syncCity';
import SyncFili from './utils/SyncFili';
import SyncOrca from './utils/SyncOrca';
import SyncProp from './utils/SyncProp';
import SyncVeda from './utils/SyncVeda';
import SyncVede from './utils/SyncVede';
import SyncVist from './utils/SyncVist';

async function runSync() {
  try {
    await Promise.all([
      SyncCity.execute(),
      SyncFili.execute(),
      SyncOrca.execute(),
      SyncProp.execute(),
      SyncVeda.execute(),
      SyncVede.execute(),
      SyncVist.execute(),
    ]);
    console.log('Sincronização de todos os módulos finalizada');
  } catch (err) {
    console.error(err);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3030);

  await runSync();

  const job = new CronJob('0 */30 * * * *', async () => {
    await runSync();
  });
  job.start();
}
bootstrap();
