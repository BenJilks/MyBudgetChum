
TSC="../../node_modules/.bin/tsc"
OUT=../../out
FLAGS=--sourceMap --lib es2017,dom

INDEX = index.ts database.ts transaction.ts repeat.ts report.ts pi-chart.ts

all: 
	$(TSC) $(INDEX) $(FLAGS) --outFile $(OUT)/index.js

watch: FLAGS+=-w
watch: all

