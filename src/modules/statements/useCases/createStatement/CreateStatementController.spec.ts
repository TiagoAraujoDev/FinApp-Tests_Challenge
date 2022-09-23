import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import authConfig from "../../../../config/auth";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a statement of deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Maico Jequisson",
      email: "mj@gmail.com",
      password: "mjasdf",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "mj@gmail.com",
      password: "mjasdf",
    });

    const { token, user } = responseToken.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 900,
        description: "Money to by food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toBe(201);
    expect(responseStatement.body).toHaveProperty("id");
    expect(responseStatement.body).toHaveProperty("amount", 900);
    expect(responseStatement.body).toHaveProperty("type", "deposit");
    expect(responseStatement.body.user_id).toEqual(user.id);
  });

  it("Should be able to create a statement of withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Maico Jequisson",
      email: "mj@gmail.com",
      password: "mjasdf",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "mj@gmail.com",
      password: "mjasdf",
    });

    const { token, user } = responseToken.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Money to by food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toBe(201);
    expect(responseStatement.body).toHaveProperty("id");
    expect(responseStatement.body).toHaveProperty("amount", 100);
    expect(responseStatement.body).toHaveProperty("type", "withdraw");
    expect(responseStatement.body.user_id).toEqual(user.id);
  });

  it("Should be able to create a statement of withdraw with insufficient founds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Maico Jequisson",
      email: "mj@gmail.com",
      password: "mjasdf",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "mj@gmail.com",
      password: "mjasdf",
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "Money to by food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toBe(400);
  });

  it("Should not be able to create a statement for a non existent user", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const user = {
      id: uuid(),
      name: "Toninho Estarque",
      email: "ehferro@gmail.com",
      password: "metaleiro1234",
    };

    const token = sign({ user }, secret, {
      subject: user.id,
      expiresIn,
    });

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Money to by food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toBe(404);
  });
});
