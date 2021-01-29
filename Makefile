.PHONY: all main
dev:
	sudo docker-compose up -d
stop:
	sudo docker-compose stop
restart:
	sudo stop dev
