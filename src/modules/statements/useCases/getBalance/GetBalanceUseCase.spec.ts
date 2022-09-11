import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { IGetBalanceDTO } from "./IGetBalanceDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("Shoud be able to get the balance for an user", async () => {
    const userData: ICreateUserDTO = {
      name: "Tony Stark",
      email: "ironman@stark.com.us",
      password: "mark1234",
    }

    const user = await createUserUseCase.execute(userData);

    const balanceDTO: IGetBalanceDTO = {
      user_id: user.id as string,
      with_statement: true,
    }

    const balance = await getBalanceUseCase.execute(balanceDTO);

    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("statement");
    expect(balance.statement).toHaveLength(0);
    expect(balance.balance).toBe(0);
  });

  it("Shoud not be able to get balance of a non existen user", async () => {
    const balanceDTO: IGetBalanceDTO = {
      user_id: "9070498572309487",
      with_statement: true
    }

    await expect(
      getBalanceUseCase.execute(balanceDTO)
    ).rejects.toEqual(new GetBalanceError());
  });
});
