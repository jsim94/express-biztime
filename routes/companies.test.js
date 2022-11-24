const fs = require("fs");
const request = require("supertest");
const app = require("../app");
const db = require("../db");

process.env.NODE_ENV = "test";

beforeEach(async () => {
  const seedSql = fs.readFileSync("testSeedData.sql", { encoding: "utf-8" });
  await db.query(seedSql);
});

afterAll(async () => {
  db.end();
});

describe("Test company get", () => {
  test("get all", async () => {
    const resp = await request(app).get("/companies");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      companies: [
        { code: "apple", name: "Apple Computer" },
        { code: "ibm", name: "IBM" },
      ],
    });
  });

  test("get one", async () => {
    const resp = await request(app).get("/companies/apple");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      company: {
        code: "apple",
        name: "Apple Computer",
        description: "Maker of OSX.",
        invoices: [1, 2, 3],
      },
    });
  });

  test("Get non-existant", async () => {
    const resp = await request(app).get("/companies/blah");
    expect(resp.statusCode).toBe(404);
  });
});

describe("Test invoice put", () => {
  test("update amount", async () => {
    const resp = await request(app).put("/invoices/1").send({ amt: 200 });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.invoice.amt).toEqual(200);
  });

  test("update paid", async () => {
    const resp = await request(app).put("/invoices/1").send({ paid: true });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.invoice.paid).toEqual(true);
    expect(resp.body.invoice.paid_date).toBeTruthy();
  });

  test("update unpaid", async () => {
    const resp = await request(app).put("/invoices/1").send({ paid: false });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.invoice.paid).toEqual(false);
    expect(resp.body.invoice.paid_date).toBeNull();
  });

  test("invalid invoice", async () => {
    const resp = await request(app).put("/invoices/20").send({ amt: 200 });
    expect(resp.statusCode).toBe(404);
  });
});
