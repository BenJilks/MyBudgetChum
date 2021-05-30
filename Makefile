
MINIFY=./node_modules/.bin/minify

release: debug
	for f in out/*.{js,html}; do $(MINIFY) $$f > temp; mv temp $$f; done
	rm out/*.map

debug:
	+$(MAKE) -C src/scripts
	+$(MAKE) -C src/html

