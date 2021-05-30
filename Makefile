
MINIFY=./node_modules/.bin/minify

release: debug
	for f in out/*.{js,html}; do $(MINIFY) $$f > temp; mv temp $$f; done

debug:
	+$(MAKE) -C src/scripts
	+$(MAKE) -C src/html

