import { Controller, Get } from "@nestjs/common";
import { getDatabaseProvider, prisma } from "@learn-database/db";
import { LTI_PACKAGE_STATUS } from "@learn-database/lti";

@Controller()
export class HealthController {
  @Get("/health")
  async health() {
    await prisma.$queryRaw`SELECT 1`;

    return {
      ok: true,
      service: "learn-database-api",
      database: getDatabaseProvider(),
      lti: LTI_PACKAGE_STATUS,
    };
  }
}
