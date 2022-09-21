import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "jd@test.com",
      password: "1324",
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a user that already exist", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Jonh Doe",
      email: "jd@test.com",
      password: "1324",
    });

    expect(response.status).toBe(400);
  });
});
