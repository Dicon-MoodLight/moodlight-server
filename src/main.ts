import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { promises as fs } from 'fs';
import { firebaseConfig } from './utils/firebase-config';

const PORT = process.env.PORT || 5000;
const SWAGGER_MODE = 'auto' as const;

(async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
  });
  let document;
  if (SWAGGER_MODE === 'auto') {
    const options = new DocumentBuilder()
      .setTitle('Mood light')
      .setDescription('Mood light 서버 API 문서입니다.')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          in: 'header',
          bearerFormat: 'JWT',
          description: '인증 토큰을 입력하세요',
        },
        'Authorization',
      )
      .build();
    document = SwaggerModule.createDocument(app, options);
    await fs
      .writeFile('./swagger-spec.json', JSON.stringify(document))
      .then((res) => console.log('created swagger file', res))
      .catch((err) => console.log(err));
  } else {
    document = JSON.parse(
      (await fs.readFile(`${__dirname}/../swagger-spec.json`)).toString(),
    );
  }
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    firebaseConfig();
  });
})();
