/* jshint node: true */
'use strict';

// PathArg arguments references items relative to the current item represented as an array of interface{}
exports.PATH_ARG = 1;
// FloatArg arguments are number literals with an optional fractional part represented as a 64 bit floats
exports.FLOAT_ARG = 1 << 1;
// IntegerArg arguments are number literals without a fractional part represented as a 64 bit integers
exports.INTEGER_ARG = 1 << 2;
// StringArg are strings literals bounded by ", ' or ` represented as strings, no escape sequences are recognised
exports.STRING_ARG = 1 << 3;
// LiteralArg can be any of the literal arguments
exports.LITERAL_ARG =
	exports.STRING_ARG |
	exports.FLOAT_ARG  |
	exports.STRING_ARG;

// TypeNames returns the names of one or more type flags
exports.typeNames = function typeNames(argType) {
	var names = [];
	if (argType & exports.PATH_ARG == exports.PATH_ARG) {
		names.push("path");
	}
	if (argType & exports.FLOAT_ARG == exports.FLOAT_ARG) {
		names.push("float");
	}
	if (argType & exports.INTEGER_ARG == exports.INTEGER_ARG) {
		names.push("integer");
	}
	if (argType & exports.STRING_ARG == exports.STRING_ARG) {
		names.push("string");
	}
	return names;
};

exports.Expression = Expression;
exports.ExpressionArgument = ExpressionArgument;
exports.Context = Context;
exports.createContext = createContext;

function Expression(data) {
	this.condition = data.condition;
	this.inverse = data.inverse || false;
	this.arguments = data.arguments || [];
}

function ExpressionArgument() {}
ExpressionArgument.prototype = {
	type: 0,
	value: null
};

// ConditionFunction is a function that can be used to filter matches.
function ConditionFunction(func, args) {
	this.testFunction = func;
	this.arguments = args || [];
}

// Context is context in which paths are evaluated against structures
function Context(conditionFunctions, options) {
	options = options || {};
	this.conditionFunctions = conditionFunctions || {};
	this.allowDescendants = options.allowDescendants || false;
}

// ConditionNames gets the names of the available conditions
Context.prototype.conditionNames = function conditionNames() {
	return Object.getOwnPropertyNames(this.ConditionFunctions);
};

function testEquals(args) {
	var matches = args[0].value;
	for (var idx in matches) {
		if (matches[idx] == args[1].value) {
			return true;
		}
	}
	return false;
}

function testContains(args)  {
	var matches = args[0].value;
	var substring = args[1].value;

	for (var idx in matches) {
		var matchString = matches[idx].toString();
		if (matchString.indexOf(substring) !== -1) {
			return true;
		}
	}
	return false;
}

function testCiContains(args)  {
	var matches = args[0].value;
	var substring = args[1].value.ToLowerCase();

	for (var idx in matches) {
		var matchString = matches[idx].toString().ToLowerCase();
		if (matchString.indexOf(substring) !== -1) {
			return true;
		}
	}
	return false;
}

function testHas(args) {
	return args[0].value.length;
}

function testEmpty(args) {
	var matches = args[0].value;
	if (!matches.length) {
		return true;
	}

	var allEmpty = true;
	for (var idx in matches) {
		switch(matches[idx]) {
		case '': case null: case 0:
				break;
		default:
			allEmpty = false;
		}
		if (!allEmpty) break;
	}

	return allEmpty;
}

function testGreater(args) {
	var matches = args[0].value;

	for (var idx in matches) {
		if (parseFloat(matches[idx]) > args[1].value) {
			return true;
		}
	}
	return false;
}

function testLess(args) {
	var matches = args[0].value;

	for (var idx in matches) {
		if (parseFloat(matches[idx]) < args[1].value) {
			return true;
		}
	}
	return false;
}

function testGreaterOrEqual(args) {
	var matches = args[0].value;

	for (var idx in matches) {
		if (parseFloat(matches[idx]) >= args[1].value) {
			return true;
		}
	}
	return false;
}

function testLessOrEqual(args) {
	var matches = args[0].value;

	for (var idx in matches) {
		if (parseFloat(matches[idx]) >= args[1].value) {
			return true;
		}
	}
	return false;
}

function testBetween(args) {
	var matches = args[0].value;

	for (var idx in matches) {
		var f0 = parseFloat(matches[idx]);
		if (f0 > args[1].value && f0 < args[2].value) {
			return true;
		}
	}
	return false;
}

// createContext creates a new evaluation context with the default condition
// functions.
function createContext() {
	var context = new Context();

	// Set up standard condition functions
	context.conditionFunctions = {
		"eq": new ConditionFunction(testEquals, [
			exports.PATH_ARG,
			exports.LITERAL_ARG
		]),
		"contains": new ConditionFunction(testContains, [
			exports.PATH_ARG,
			exports.STRING_ARG
		]),
		"cicontains": new ConditionFunction(testCiContains, [
			exports.PATH_ARG,
			exports.STRING_ARG
		]),
		"gt": new ConditionFunction(testGreater, [
			exports.PATH_ARG,
			exports.FLOAT_ARG
		]),
		"lt": new ConditionFunction(testLess, [
			exports.PATH_ARG,
			exports.FLOAT_ARG
		]),
		"gte": new ConditionFunction(testGreaterOrEqual, [
			exports.PATH_ARG,
			exports.FLOAT_ARG
		]),
		"lte": new ConditionFunction(testLessOrEqual, [
			exports.PATH_ARG,
			exports.FLOAT_ARG
		]),
		"between": new ConditionFunction(testBetween, [
			exports.PATH_ARG,
			exports.FLOAT_ARG,
			exports.FLOAT_ARG
		]),
		"has": new ConditionFunction(testHas, [
			exports.PATH_ARG
		]),
		"empty": new ConditionFunction(testEmpty, [
			exports.PATH_ARG
		]),
	};

	return context;
}
