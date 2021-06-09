
COMPILER=python ../../scripts/htmltemplate.py
OUT=../../out
SOURCES = index.htmlc transaction_view.htmlc spending.htmlc
FLAGS=

%.htmlc: %.html
	$(COMPILER) $(FLAGS) $< $(OUT)/$< &

all: $(SOURCES)

watch: FLAGS=-w
watch: all

