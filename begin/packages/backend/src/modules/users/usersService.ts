import { User, ValidatedUser } from "@dddforum/shared/src/api/users";
import { TextUtil } from "@dddforum/shared/src/utils/textUtils";

import { CreateUserCommand } from "./usersCommand";
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
  UsernameAlreadyTakenException,
} from "./usersExceptions";
import { UsersRepository } from "./ports/usersRepository";

import { TransactionalEmailAPI } from "../marketing/transactionalEmailAPI";

export class UsersService {
  constructor(
    private repository: UsersRepository,
    private emailAPI: TransactionalEmailAPI,
  ) {}

  async createUser(userData: CreateUserCommand): Promise<User> {
    const existingUserByEmail = await this.repository.findByEmail(
      userData.email,
    );
    if (existingUserByEmail) {
      throw new EmailAlreadyInUseException(userData.email);
    }

    const existingUserByUsername = await this.repository.findByUsername(
      userData.username,
    );
    if (existingUserByUsername) {
      throw new UsernameAlreadyTakenException(userData.username);
    }

    const validatedUser: ValidatedUser = {
      ...userData.props,
      password: TextUtil.createRandomText(10),
    };

    const user = await this.repository.save(validatedUser);

    await this.emailAPI.sendMail({
      to: user.email,
      subject: "Your login details to DDDForum",
      text: `Welcome to DDDForum. You can login with the following details </br>
      email: ${user.email}
      password: ${user.password}`,
    });

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException(email);
    }
    return user;
  }
}
