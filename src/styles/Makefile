
SASS="../../node_modules/.bin/sass"
OUT=../../out
SOURCES = index.css

%.css: %.sass
	$(SASS) $<:$(OUT)/$@

all: $(SOURCES)

