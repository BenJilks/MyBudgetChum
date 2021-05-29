
TSC=../../node_modules/.bin/tsc
OUT=../../out

SCRIPTS = index.js

%.js: %.ts
	$(TSC) $< --outFile $(OUT)/$@

all: $(SCRIPTS)

