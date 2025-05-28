const request = require("supertest");
const app = require("../app");

describe("GET /api/transactions", () => {
  it("should return status 200 and JSON", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
