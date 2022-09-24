import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO = Pick<
  Statement,
  "receiver_id" | "user_id" | "description" | "amount" | "type"
>;
