import { EntityRepository, Repository } from "typeorm";
import { MatchHistoryEntity } from "./match-history.entity";

@EntityRepository(MatchHistoryEntity)
export class MatchHistoryRepository extends Repository<MatchHistoryEntity> {}