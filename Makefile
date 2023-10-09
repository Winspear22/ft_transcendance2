all: up
up:
	docker-compose up --build

down:
	docker-compose down

rm:
	docker-compose rm

rmi:
	docker-compose down --rmi all

fclean:
	 docker-compose -f docker-compose.yml down \
	&&  docker system prune -a --force \
	&&  rm -Rf /home/naben-za/volume_naben-za/*

show:
	sudo docker container ps -a
show_network:
	sudo docker network ls

volume_show:
	sudo docker volume ls

volume_delete:
	sudo docker volume prune
volume_delete2:
	bash
	sudo docker volume rm $(docker volume ls -q)
	exit
post:
	sudo docker exec -it postgresql bash -l
pgadmin:
	sudo docker exec -it pgadmin sh
node:
	sudo docker exec -it nestjs bash -l
vuejs:
	sudo docker exec -it vuejs bash -l

retry:
	make down
	make volume_delete
	sudo find /home/naben-za/volume_naben-za -mindepth 1 -delete
	make fclean
	make up
inspect:
	sudo docker inspect postgresql | grep "IPAddress"

.PHONY: up down rm rmi show volume_show volume_delete \
post pgadmin pgadmin fclean inspect retry all show_network \
volume_delete2
