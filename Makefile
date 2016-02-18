SHELL:=/bin/bash -O extglob

lint:
	./node_modules/.bin/jshint -c .jshintrc lib/*.js

test:
	./node_modules/.bin/mocha

# Use blanket.js to test code coverage and output to ./coverage.html
test-cov:
	./node_modules/.bin/mocha --require blanket -R html-cov > coverage.html

docs:
	node_modules/.bin/jsdoc -t node_modules/ink-docstrap/template -R README.md -c ./jsdoc.conf.json

docs_clear:
	rm -rf ./docs/loan/*

docs_refresh: docs_clear docs

docs_deploy:
	rsync --delete -r docs/loan oceandatorn:~/shared/loan/public_html

.PHONY: test test-cov lint docs docs_deploy docs_refresh docs_clear
