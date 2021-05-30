
TSC=../../node_modules/.bin/tsc
OUT=../../out

INDEX = index.ts database.ts transaction.ts

index:
	$(TSC) $(INDEX) --sourceMap --lib es2015,dom --outFile $(OUT)/index.js

all: index

