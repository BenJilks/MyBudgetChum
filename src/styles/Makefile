
SASS="../../node_modules/.bin/sass"
OUT=../../out
SOURCES = index.css pi_chart.css bar_chart.css nav_bar.css
FLAGS=

%.css: %.sass
	$(SASS) $(FLAGS) $<:$(OUT)/$@ &

all: $(SOURCES)

watch: FLAGS=-w
watch: all

