import { Repository } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {
  findById(id: string) {
    if (!id) {
      return null;
    }
    return super.findOneById(id);
  }

  findByAll() {
    return super.find();
  }
}
