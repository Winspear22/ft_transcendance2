import { EntityRepository, Repository } from "typeorm";
import { UserEntity } from './user.entity'
import { User42Dto } from "./user42.dto";

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> 
{
    async createUser422(userData: User42Dto): Promise<UserEntity> {
        const user: UserEntity = this.create(userData);
        const numberUsers = await this.createQueryBuilder('user').getCount().catch(() => 0);
        return this.save(user);
    }
}