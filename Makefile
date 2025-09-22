up:
	docker compose up -d

down:
	docker compose down

ps:
	docker compose ps

shell:
	docker compose exec nginx /bin/bash
