import { Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;
  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }
  search(searchFields: string[]) {
    if (this?.query?.search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchFields.map((el) => ({
          [el]: { $regex: this?.query?.search, $options: 'i' },
        })),
      });
    }
    return this;
  }
  sort() {
    let sortBy = 'createdAt';
    let sortOrder = 'asc';
    if (this?.query?.sortBy) {
      sortBy = this?.query?.sortBy as string;
    }
    if (this?.query?.sortOrder) {
      sortOrder = this?.query?.sortOrder as string;
    }
    this.modelQuery = this.modelQuery.sort({
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    });
    return this;
  }
  filter() {
    if (this?.query?.filter) {
      this.modelQuery = this?.modelQuery.find({ _id: this?.query?.filter });
    }
    return this;
  }
}

export default QueryBuilder;