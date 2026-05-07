import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const port = Number(process.env.PORT ?? 4000);

const app = await NestFactory.create(AppModule);
app.enableCors({
  origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
});

await app.listen(port);

console.log(`Learn Database API listening on http://localhost:${port}`);
