import { stringify } from "ts-jest";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "./CreateStatementController";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a statement of deposit", async () => {
    const userData: ICreateUserDTO = {
      name: "Mary Scarlet da Silva",
      email: "caustica@mylove.com",
      password: "tlove1234"
    }
    
    const user = await createUserUseCase.execute(userData);

    const statementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Money to buy something pretty",
    }

    const depositStatement = await createStatementUseCase.execute(statementData);

    expect(depositStatement).toHaveProperty("id");
    expect(depositStatement.amount).toEqual(10000);
    expect(depositStatement.user_id).toEqual(user.id);
    expect(depositStatement.description).toEqual("Money to buy something pretty");
    expect(depositStatement).toHaveProperty("type", 'deposit');
  });

  it("Should be able to create a statement of withdraw", async () => {
    // TODO
  });

  it("Should not be able to create a statement of a non existen user", async () => {
    // TODO
  });

  it("Should not be able to create a statement if insuficient founds", async () => {
    // TODO
  });
});
