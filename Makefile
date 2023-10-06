all: up

up:
	 docker compose up --build

sync:
	./syncFolder.sh &

down:
	 docker-compose down

rm:
	 docker-compose rm

rmi:
	 docker-compose down --rmi all

fclean:
	 docker-compose -f docker-compose.yml down \
	&&  docker system prune -a --force \
	&&  rm -Rf /tmp/vol_naben-za/*

show:
	 docker container ps -a
show_network:
	 docker network ls

volume_show:
	 docker volume ls

volume_delete:
	 docker volume prune
volume_delete2:
	bash
	 docker volume rm $(docker volume ls -q)
	exit
post:
	 docker exec -it postgresql bash -l
pgadmin:
	 docker exec -it pgadmin sh
node:
	 docker exec -it nestjs bash -l
vuejs:
	 docker exec -it vuejs bash -l

retry:
	make down
	make volume_delete
	 find /tmp/vol_naben-za -mindepth 1 -delete
	make fclean
	make up
inspect:
	 docker inspect postgresql | grep "IPAddress"

.PHONY: up down rm rmi show volume_show volume_delete \
post pgadmin pgadmin_sudo fclean inspect retry all show_network \
volume_delete2
