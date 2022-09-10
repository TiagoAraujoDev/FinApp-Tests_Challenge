import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "./CreateStatementController";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
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
    const userData: ICreateUserDTO = {
      name: "Mr. Tiago",
      email: "tiago@test.com",
      password: "asdf"
    }
    
    const user = await createUserUseCase.execute(userData);

    const depositStatementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Money to buy something pretty",
    }

    await createStatementUseCase.execute(depositStatementData);

    const withdrawStatementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 10000,
      description: "Money to buy something pretty",
    }

    const withdrawStatement = await createStatementUseCase.execute(withdrawStatementData);

    expect(withdrawStatement).toHaveProperty("id");
    expect(withdrawStatement.amount).toEqual(10000);
    expect(withdrawStatement.user_id).toEqual(user.id);
    expect(withdrawStatement.description).toEqual("Money to buy something pretty");
    expect(withdrawStatement).toHaveProperty("type", 'withdraw');
  });

  it("Should not be able to create a statement of a non existen user", async () => {
    const depositStatementData: ICreateStatementDTO = {
      user_id: "98234720397849",
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Money to buy something pretty",
    }

    await expect(
      createStatementUseCase.execute(depositStatementData)
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("Should not be able to create a withdraw statement with insufficient founds", async () => {
    const userData: ICreateUserDTO = {
      name: "Steve Rogers",
      email: "godheart@marvel.com",
      password: "1234"
    }
    
    const user = await createUserUseCase.execute(userData);

    const depositStatementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Money to buy something pretty",
    }

    await createStatementUseCase.execute(depositStatementData);

    const withdrawStatementData: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 101,
      description: "Money to buy something pretty",
    }

    await expect(
      createStatementUseCase.execute(withdrawStatementData)
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
