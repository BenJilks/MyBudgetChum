
COMPILER=python ../../scripts/htmltemplate.py
OUT=../../out
SOURCES = index.htmlc

%.htmlc: %.html
	$(COMPILER) $< $(OUT)/$<

all: $(SOURCES)

