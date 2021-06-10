
MINIFY=./node_modules/.bin/minify

debug:
	npx rollup -c src/scripts/config/index.config.js
	npx rollup -c src/scripts/config/transaction_view.config.js
	npx rollup -c src/scripts/config/spending.config.js
	npx rollup -c src/scripts/config/repeat.config.js
	npx rollup -c src/scripts/config/settings.config.js
	+"$(MAKE)" -C src/styles
	+"$(MAKE)" -C src/html

watch:
	npx rollup -c src/scripts/config/index.config.js -w &
	npx rollup -c src/scripts/config/transaction_view.config.js -w &
	npx rollup -c src/scripts/config/spending.config.js -w &
	npx rollup -c src/scripts/config/repeat.config.js -w &
	npx rollup -c src/scripts/config/settings.config.js -w &
	+"$(MAKE)" -C src/styles watch &
	+"$(MAKE)" -C src/html watch

release: debug
	for f in out/*.{js,html}; do $(MINIFY) $$f > temp; mv temp $$f; done
	rm out/*.map

