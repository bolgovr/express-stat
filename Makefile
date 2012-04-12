TEST_REPORTER = list
ALL_TESTS = test/*.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(TEST_REPORTER) \
		--timeout 1000 \
		$(ALL_TESTS)


.PHONY: all test clean
