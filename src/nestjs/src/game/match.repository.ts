import { EntityRepository, Repository } from "typeorm";
import { MatchEntity } from "./match.entity";

@EntityRepository(MatchEntity)
export class MatchRepository extends Repository<MatchEntity> {}