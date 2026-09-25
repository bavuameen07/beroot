import "reflect-metadata";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { AppModule } from "./app.module";

let appPromise: Promise<NestExpressApplication> | undefined;

function createApp(): Promise<NestExpressApplication> {
  if (!appPromise) {
    appPromise = NestFactory.create<NestExpressApplication>(AppModule).then(async (app) => {
      const publicPath = join(__dirname, "..", "public");

      app.useStaticAssets(publicPath, { index: "index.html" });
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }));
      await app.init();
      return app;
    });
  }

  return appPromise;
}

async function bootstrap(): Promise<void> {
  const app = await createApp();
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
}

const handler = async (request: Request, response: Response): Promise<void> => {
  const app = await createApp();
  const express = app.getHttpAdapter().getInstance();
  express(request, response);
};

if (process.env.VERCEL !== "1" && !process.env.VERCEL_URL) {
  void bootstrap();
}

export = handler;
