
MINIFY=./node_modules/.bin/minify

debug:
	npx rollup -c rollup.config.js
	+"$(MAKE)" -C src/styles
	+"$(MAKE)" -C src/html

watch:
	npx rollup -c rollup.config.js -w &
	+"$(MAKE)" -C src/styles watch &
	+"$(MAKE)" -C src/html watch

release: debug
	for f in out/*.{js,html}; do $(MINIFY) $$f > temp; mv temp $$f; done
	rm out/*.map

