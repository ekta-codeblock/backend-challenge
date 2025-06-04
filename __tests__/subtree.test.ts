import request from "supertest";
import app from "../src/index"; // Ensure `app` is exported in index.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let server;

beforeAll(async () => {
  server = app.listen(0); // Start server on random port for testing
  await prisma.property.deleteMany();
  await prisma.node.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  if (server && server.close) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("POST /nodes", () => {
  it("should create a root node", async () => {
    const res = await request(app).post("/nodes").send({
      name: "TestPC",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("TestPC");
  });

  it("should create a child node", async () => {
    const parent = await prisma.node.create({ data: { name: "ParentNode" } });

    const res = await request(app).post("/nodes").send({
      name: "ChildNode",
      parentId: parent.id,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.parentId).toBe(parent.id);
  });
});

describe("POST /nodes/:id/properties", () => {
  it("should add a property to a node", async () => {
    const node = await prisma.node.create({ data: { name: "PropNode" } });

    const res = await request(app)
      .post(`/nodes/${node.id}/properties`)
      .send({
        key: "Speed",
        value: 3.14,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.key).toBe("Speed");
    expect(Number(res.body.value)).toBeCloseTo(3.14);
  });

  it("should fail with invalid value", async () => {
    const node = await prisma.node.create({ data: { name: "BadPropNode" } });

    const res = await request(app)
      .post(`/nodes/${node.id}/properties`)
      .send({
        key: "Invalid",
        value: "not-a-number",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should fail with missing key", async () => {
    const node = await prisma.node.create({ data: { name: "MissingKeyNode" } });

    const res = await request(app)
      .post(`/nodes/${node.id}/properties`)
      .send({
        value: 1.23,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should fail with missing value", async () => {
    const node = await prisma.node.create({ data: { name: "MissingValueNode" } });

    const res = await request(app)
      .post(`/nodes/${node.id}/properties`)
      .send({
        key: "NoValue",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe("GET /subtree", () => {
  beforeAll(async () => {
    const root = await prisma.node.create({ data: { name: "AlphaPC" } });

    const processing = await prisma.node.create({
      data: { name: "Processing", parentId: root.id },
    });

    const cpu = await prisma.node.create({
      data: { name: "CPU", parentId: processing.id },
    });

    await prisma.property.create({
      data: { key: "Cores", value: 4, nodeId: cpu.id },
    });
  });

  it("should fetch a valid subtree", async () => {
    const res = await request(app).get("/subtree?path=/AlphaPC");

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("AlphaPC");
    expect(res.body.children.length).toBeGreaterThan(0);
  });

  it("should return 404 for invalid path", async () => {
    const res = await request(app).get("/subtree?path=/Nonexistent");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Path not found");
  });
});
