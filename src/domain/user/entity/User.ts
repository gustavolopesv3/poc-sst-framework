import { Email } from "../value-objects/Email";

export interface UserProps {
  id?: string;
  name: string;
  email: Email;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id?: string;
  private _name: string;
  private _email: Email;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
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

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email.value,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  static create(props: { id?: string; name: string; email: string; createdAt?: Date; updatedAt?: Date }): User {
    const email = new Email(props.email);
    return new User({
      id: props.id,
      name: props.name,
      email,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}

