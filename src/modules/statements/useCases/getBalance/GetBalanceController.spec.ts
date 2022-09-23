import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import authConfig from "../../../../config/auth";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show the balance of the user account", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Zeus Da Silva",
      email: "zz@gmail.com",
      password: "zeus1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "zz@gmail.com",
      password: "zeus1234",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 300,
        description: "To buy something",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 150,
        description: "To buy something",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseBalance.body).toHaveProperty("balance");
    expect(responseBalance.body).toHaveProperty("balance", 150);
    expect(responseBalance.body.statement).toHaveLength(2);
  });

  it("Should not be able to get a balance for a non existent user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const user = {
      id: uuid(),
      name: "Josias Mineiro",
      email: "josiasOmineiro@gmail.com",
      password: "josias1234",
    };

    const token = sign({ user }, secret, {
      subject: user.id,
      expiresIn: expiresIn,
    });

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseBalance.status).toBe(404);
  });
});
