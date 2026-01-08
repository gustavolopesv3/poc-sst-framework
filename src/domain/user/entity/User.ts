import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";

export interface UserProps {
  id?: string;
  name: string;
  email: Email;
  password: Password;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id?: string;
  private _name: string;
  private _email: Email;
  private _password: Password;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateName(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  updateEmail(email: Email): void {
    this._email = email;
    this._updatedAt = new Date();
  }

  async updatePassword(password: string): Promise<void> {
    this._password = await Password.create(password);
    this._updatedAt = new Date();
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email.value,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  static async create(props: {
    id?: string;
    name: string;
    email: string;
    password: string;
    passwordHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Promise<User> {
    const email = new Email(props.email);
    const password = props.passwordHash
      ? Password.fromHash(props.passwordHash)
      : await Password.create(props.password);

    return new User({
      id: props.id,
      name: props.name,
      email,
      password,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
