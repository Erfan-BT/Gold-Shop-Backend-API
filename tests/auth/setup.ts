import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import sequelize from "../../src/configs/sequelize.config.js";

beforeAll(async () => {
    // اتصال به دیتابیس تست
    await sequelize.authenticate();
});

beforeEach(async () => {
    // در صورت نیاز قبل از هر تست
});

afterEach(async () => {
    // پاک کردن Mock ها
});

afterAll(async () => {
    // بستن اتصال دیتابیس
    await sequelize.close();
});