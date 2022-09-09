import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create a User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a user", async () => {
    const user = await createUserUseCase.execute({
      name: "Jonh Doe",
      email: "jonhdoe@test.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name", "Jonh Doe");
    expect(user).toHaveProperty("email", "jonhdoe@test.com");
    expect(user).toBeInstanceOf(User);
  });

  it("Should not be able to create a user that already exist", async () => {
    await createUserUseCase.execute({
      name: "Jonh Nick",
      email: "jonhnick@test.com",
      password: "asdf",
    });

    await expect( 
      createUserUseCase.execute({
        name: "Jonh Nick",
        email: "jonhnick@test.com",
        password: "asdf",
      })
    ).rejects.toEqual(new CreateUserError());
  });
});
