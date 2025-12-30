import { Collection, ObjectId } from "mongodb";
import { User } from "../../../../domain/user/entity/User";
import { IUserRepository } from "../../../../domain/user/repository/IUserRepository";
import { connectToDatabase } from "../connection";

interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoUserRepository implements IUserRepository {
  private collection: Collection<UserDocument> | null = null;

  private async getCollection(): Promise<Collection<UserDocument>> {
    if (!this.collection) {
      const db = await connectToDatabase();
      this.collection = db.collection<UserDocument>("users");
    }
    return this.collection;
  }

  private toEntity(doc: UserDocument): User {
    return User.create({
      id: doc._id?.toString(),
      name: doc.name,
      email: doc.email,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(user: User): Omit<UserDocument, "_id"> {
    return {
      name: user.name,
      email: user.email.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(user: User): Promise<User> {
    const collection = await this.getCollection();
    const document = this.toDocument(user);

    const result = await collection.insertOne(document as UserDocument);

    return User.create({
      id: result.insertedId.toString(),
      name: document.name,
      email: document.email,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const collection = await this.getCollection();

    try {
      const document = await collection.findOne({ _id: new ObjectId(id) });

      if (!document) {
        return null;
      }

      return this.toEntity(document);
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ email: email.toLowerCase() });

    if (!document) {
      return null;
    }

    return this.toEntity(document);
  }

  async findAll(): Promise<User[]> {
    const collection = await this.getCollection();
    const documents = await collection.find().toArray();

    return documents.map((doc) => this.toEntity(doc));
  }

  async update(user: User): Promise<User> {
    const collection = await this.getCollection();
    const document = this.toDocument(user);

    await collection.updateOne(
      { _id: new ObjectId(user.id) },
      { $set: document }
    );

    return user;
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });
  }
}

