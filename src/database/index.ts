import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  return createConnection(
    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : "postgres-finAppdb",
      database: process.env.NODE_ENV === "test" ? "testdb" : "fin_api",
    })
  );
};
