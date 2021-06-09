
SASS="../../node_modules/.bin/sass"
OUT=../../out
SOURCES = index.css transaction_view.css
FLAGS=

%.css: %.sass
	$(SASS) $(FLAGS) $<:$(OUT)/$@ &

all: $(SOURCES)

watch: FLAGS=-w
watch: all

