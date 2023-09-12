all: up

up: sync
	sudo docker-compose up --build

sync:
	./syncFolder.sh &

down:
	sudo docker-compose down

rm:
	sudo docker-compose rm

rmi:
	sudo docker-compose down --rmi all

fclean:
	sudo docker-compose -f docker-compose.yml down \
	&& sudo docker system prune -a --force \
	&& sudo rm -Rf /Users/administrateur/42/data/*

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
	docker volume rm $(docker volume ls -q)
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
	sudo find /Users/administrateur/42/data -mindepth 1 -delete
	make fclean
	make up
inspect:
	sudo docker inspect postgresql | grep "IPAddress"

.PHONY: up down rm rmi show sync volume_show volume_delete \
post pgadmin pgadmin_sudo fclean inspect retry all show_network \
volume_delete2
