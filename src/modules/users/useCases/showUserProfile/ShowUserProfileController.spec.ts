import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";

import { app } from "../../../../app";
import createConnection from "../../../../database";
import authConfig from "../../../../config/auth";

let connection: Connection;

describe("Show User Profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show user profile informations", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Thor Liloco",
      email: "thorliloco@gmail.com",
      password: "thor1234",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "thorliloco@gmail.com",
      password: "thor1234",
    });

    const { token } = responseToken.body;

    const responseProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseProfile.status).toBe(200);
    expect(responseProfile.body).toHaveProperty("id");
    expect(responseProfile.body).toHaveProperty("name", "Thor Liloco");
    expect(responseProfile.body).toHaveProperty(
      "email",
      "thorliloco@gmail.com"
    );
  });

  it("Should not be able to show profile with a invalid JWT token", async () => {
    const token = "15hj3g45jh-1h234f2u-12h3fj";
    const responseProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseProfile.status).toBe(401);
  });

  it("Should not be able to show profile of a non existent user", async () => {
    const { secret, expiresIn } = authConfig.jwt;
    const user = {
      id: "e23fa57d-41e4-4f4d-8935-2bc3ad910ec7",
      name: "Toninho Estarque",
      email: "ehferro@gmail.com",
      password: "metaleiro1234",
    };

    const token = sign({ user }, secret, {
      subject: user.id,
      expiresIn,
    });

    const responseProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseProfile.status).toBe(404);
  });
});
