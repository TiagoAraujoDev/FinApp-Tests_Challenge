import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("Should be able to get the user profile", async () => {
    const userData: ICreateUserDTO = {
      name: "Dr. Strange",
      email: "sorcererSupreme@reality.com.u",
      password: "1:14000000000",
    };

    const user = await createUserUseCase.execute(userData);
    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toHaveProperty("id");
    expect(userProfile.created_at).toEqual(user.created_at);
    expect(userProfile.updated_at).toEqual(user.updated_at);
    expect(userProfile.name).toEqual("Dr. Strange");
    expect(userProfile.email).toEqual("sorcererSupreme@reality.com.u");
  });

  it("Should not be able to get the profile of an non existen user", async () => {
    await expect(
      showUserProfileUseCase.execute("9348572-0498-097-867")
    ).rejects.toEqual(new ShowUserProfileError());
  });
});
