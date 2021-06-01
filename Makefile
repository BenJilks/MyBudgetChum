
MINIFY=./node_modules/.bin/minify

debug:
	+"$(MAKE)" -C src/scripts
	+"$(MAKE)" -C src/html

release: debug
	for f in out/*.{js,html}; do $(MINIFY) $$f > temp; mv temp $$f; done
	rm out/*.map

