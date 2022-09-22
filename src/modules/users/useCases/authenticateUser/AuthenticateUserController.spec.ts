import { Connection } from "typeorm";
import request from "supertest";

import createConnection from "../../../../database";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    connection.dropDatabase();
    connection.close();
  });

  it("Should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jonh lennon",
      email: "jl@test.com",
      password: "asdf",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "jl@test.com",
      password: "asdf",
    });

    expect(response.status).toBe(200);
  });

  it("Should not be able to authenticate a user with incorrect email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Tiago da Silva",
      email: "testTiago@test.com",
      password: "asdf",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "testErrorTiago@test.com",
      password: "asdf",
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate a user with incorrect email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Mary Araujo",
      email: "testMary@test.com",
      password: "asdf",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "testMary@test.com",
      password: "1234",
    });

    expect(response.status).toBe(401);
  });
});
