import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get a statement operation", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Vanda Feiticeira",
      email: "scarlatte@gmail.com",
      password: "vanda1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "scarlatte@gmail.com",
      password: "vanda1234",
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Money to buy food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${responseStatement.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatementOperation.status).toBe(200);
  });

  it("Should not be able to get a statement operation", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const user = {
      id: uuid(),
      name: "Jonh da Silva",
      email: "js@gmail.com",
      password: "jonh123",
    };

    const token = sign({ user }, secret, {
      subject: user.id,
      expiresIn: expiresIn,
    });

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatementOperation.status).toBe(404);
  });

  it("Should not be able to get a statement operation that does not exist", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Denis Pimentinha",
      email: "dp@gmail.com",
      password: "denis1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "dp@gmail.com",
      password: "denis1234",
    });

    const { token } = responseToken.body;

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatementOperation.status).toBe(404);
  });
});
