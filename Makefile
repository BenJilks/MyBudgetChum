
MINIFY=./node_modules/.bin/minify

debug:
	npx rollup -c src/scripts/config/index.config.js &
	npx rollup -c src/scripts/config/transaction_view.config.js &
	npx rollup -c src/scripts/config/spending.config.js &
	npx rollup -c src/scripts/config/repeat.config.js &
	npx rollup -c src/scripts/config/settings.config.js &
	npx rollup -c src/scripts/config/service_worker.config.js &
	npx rollup -c src/scripts/config/shopping_list.config.js
	+"$(MAKE)" -C src/styles
	+"$(MAKE)" -C src/html
	+"$(MAKE)" -C src/static

watch:
	npx rollup -c src/scripts/config/index.config.js -w &
	npx rollup -c src/scripts/config/transaction_view.config.js -w &
	npx rollup -c src/scripts/config/spending.config.js -w &
	npx rollup -c src/scripts/config/repeat.config.js -w &
	npx rollup -c src/scripts/config/settings.config.js -w &
	npx rollup -c src/scripts/config/service_worker.config.js -w &
	npx rollup -c src/scripts/config/shopping_list.config.js -w &
	+"$(MAKE)" -C src/styles watch &
	+"$(MAKE)" -C src/html watch &
	+"$(MAKE)" -C src/static

release: 
	bash -c "for f in out/*.{js,html,css}; do $(MINIFY) \$$f > temp; mv temp \$$f; done"
	rm -f out/*.map

