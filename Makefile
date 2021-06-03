
MINIFY=./node_modules/.bin/minify

debug:
	+"$(MAKE)" -C src/scripts
	+"$(MAKE)" -C src/styles
	+"$(MAKE)" -C src/html

watch:
	+"$(MAKE)" -C src/scripts watch &
	+"$(MAKE)" -C src/styles watch &
	+"$(MAKE)" -C src/html watch

release: debug
	for f in out/*.{js,html}; do $(MINIFY) $$f > temp; mv temp $$f; done
	rm out/*.map

