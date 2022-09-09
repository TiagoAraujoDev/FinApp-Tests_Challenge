import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let autheticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    autheticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to autheticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "Jonh Doe",
      email: "jonhdoe@test.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await autheticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authenticatedUser).toHaveProperty("token");
    expect(authenticatedUser).toHaveProperty("user");
    expect(authenticatedUser.user.name).toEqual("Jonh Doe");
    expect(authenticatedUser.user.email).toEqual("jonhdoe@test.com");
  });

  it("Should not be able to Authenticate a non existen user", async () => {
    await expect( 
      autheticateUserUseCase.execute({
        email: "killmong@villan.com",
        password : "123bad",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("Should not be able to Authenticate a user with a wrong password", async () => {
    const user: ICreateUserDTO = {
      name: "Slash da Silva",
      email: "gunslash@test.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    await expect( 
      autheticateUserUseCase.execute({
        email: "gunslash@test.com",
        password : "wrongPassword",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
