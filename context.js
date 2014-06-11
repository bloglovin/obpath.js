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
exports.LITERAL_ARG = STRING_ARG | FLOAT_ARG | STRING_ARG;

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
function ConditionFunction(data) {
	this.testFunction = data.testFunction;
	this.arguments = data.arguments || [];
}

// Context is context in which paths are evaluated against structures
function Context(conditionFunctions, options) {
	options = options || {};
	this.conditionFunctions = conditionFunctions;
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

func testGreater(arguments []ExpressionArgument) bool {
	matches := arguments[0].Value.([]interface{})

	_, f1 := FloatCast(arguments[1].Value)

	for _, match := range matches {
		error, f0 := FloatCast(match)
		if error != nil {
			continue
		}

		if f0 > f1 {
			return true
		}
	}
	return false
}

func testLess(arguments []ExpressionArgument) bool {
	matches := arguments[0].Value.([]interface{})

	_, f1 := FloatCast(arguments[1].Value)

	for _, match := range matches {
		error, f0 := FloatCast(match)
		if error != nil {
			continue
		}

		if f0 < f1 {
			return true
		}
	}
	return false
}

func testGreaterOrEqual(arguments []ExpressionArgument) bool {
	matches := arguments[0].Value.([]interface{})

	_, f1 := FloatCast(arguments[1].Value)

	for _, match := range matches {
		error, f0 := FloatCast(match)
		if error != nil {
			continue
		}

		if f0 >= f1 {
			return true
		}
	}
	return false
}

func testLessOrEqual(arguments []ExpressionArgument) bool {
	matches := arguments[0].Value.([]interface{})

	_, f1 := FloatCast(arguments[1].Value)

	for _, match := range matches {
		error, f0 := FloatCast(match)
		if error != nil {
			continue
		}

		if f0 <= f1 {
			return true
		}
	}
	return false
}

func testBetween(arguments []ExpressionArgument) bool {
	matches := arguments[0].Value.([]interface{})

	_, f1 := FloatCast(arguments[1].Value)
	_, f2 := FloatCast(arguments[2].Value)

	for _, match := range matches {
		error, f0 := FloatCast(match)
		if error != nil {
			continue
		}

		if f0 > f1 && f0 < f2 {
			return true
		}
	}
	return false
}

// NewContext creates a new evaluation context
func NewContext() *Context {
	context := Context{}

	// Set up standard condition functions
	context.ConditionFunctions = map[string]*ConditionFunction{
		"eq": &ConditionFunction{
			TestFunction: testEquals,
			Arguments: []int{
				PathArg,
				LiteralArg,
			},
		},
		"contains": &ConditionFunction{
			TestFunction: testContains,
			Arguments: []int{
				PathArg,
				StringArg,
			},
		},
		"cicontains": &ConditionFunction{
			TestFunction: testCiContains,
			Arguments: []int{
				PathArg,
				StringArg,
			},
		},
		"gt": &ConditionFunction{
			TestFunction: testGreater,
			Arguments: []int{
				PathArg,
				FloatArg,
			},
		},
		"lt": &ConditionFunction{
			TestFunction: testLess,
			Arguments: []int{
				PathArg,
				FloatArg,
			},
		},
		"gte": &ConditionFunction{
			TestFunction: testGreaterOrEqual,
			Arguments: []int{
				PathArg,
				FloatArg,
			},
		},
		"lte": &ConditionFunction{
			TestFunction: testLessOrEqual,
			Arguments: []int{
				PathArg,
				FloatArg,
			},
		},
		"between": &ConditionFunction{
			TestFunction: testBetween,
			Arguments: []int{
				PathArg,
				FloatArg,
				FloatArg,
			},
		},
		"has": &ConditionFunction{
			TestFunction: testHas,
			Arguments: []int{
				PathArg,
			},
		},
		"empty": &ConditionFunction{
			TestFunction: testEmpty,
			Arguments: []int{
				PathArg,
			},
		},
	}

	return &context
}
