import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });
  it("Should be able to get a statement Operation", async () => {
    const userData: ICreateUserDTO = {
      name: "Jonh Doe",
      email: "jonhdoe@gmail.com",
      password: "1234",
    };

    const { id: user_id } = await createUserUseCase.execute(userData);

    const statementData: ICreateStatementDTO = {
      user_id: user_id as string,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Money to buy something pretty",
    };

    const { id: statement_id } = await createStatementUseCase.execute(
      statementData
    );

    interface IRequest {
      user_id: string;
      statement_id: string;
    }

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    } as IRequest);

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user_id as string);
    expect(statement.type).toEqual("deposit");
    expect(statement.amount).toEqual(10000);
  });

  it("Should not be able to get the statement of a non existent user", async () => {
    const userData: ICreateUserDTO = {
      name: "Jonh Doe",
      email: "jonhdoe@gmail.com",
      password: "1234",
    };

    const { id } = await createUserUseCase.execute(userData);

    const statementData: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Money to buy something pretty",
    };

    const { id: statement_id } = await createStatementUseCase.execute(
      statementData
    );

    interface IRequest {
      user_id: string;
      statement_id: string;
    }

    const user_id = "wrongId";

    await expect(
      getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      } as IRequest)
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("Should not be able to get a statement that does not exist", async () => {
    const userData: ICreateUserDTO = {
      name: "Jonh Doe",
      email: "jonhdoe@gmail.com",
      password: "1234",
    };

    const { id: user_id } = await createUserUseCase.execute(userData);

    const statementData: ICreateStatementDTO = {
      user_id: user_id as string,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Money to buy something pretty",
    };

    await createStatementUseCase.execute(statementData);

    interface IRequest {
      user_id: string;
      statement_id: string;
    }

    const statement_id = "wrongOrNonExistent";

    await expect(
      getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      } as IRequest)
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});
