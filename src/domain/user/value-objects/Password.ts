import * as bcrypt from "bcryptjs";

export class Password {
  private readonly _hash: string;

  private constructor(hash: string) {
    this._hash = hash;
  }

  get hash(): string {
    return this._hash;
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hash);
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword || plainPassword.length < 6) {
      throw new Error("Password must have at least 6 characters");
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }
}

