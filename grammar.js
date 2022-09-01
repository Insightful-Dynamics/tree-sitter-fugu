const statementSeq = seq(
	repeat(
		seq(
			optional(
				sym('_statement')
			), sym('_terminator')
		)
	),
	optional(
		sym('_statement')
	)
);

module.exports = grammar({
	name: 'fugu',

	precedences: _ => [
		[
			"postfix",
			"prefix",
			"exponent",
			"multiplicative",
			"additive",
			"relational",
			"equality"
		],
	],

	externals: $ => [$._concat, '}', ')'],

	word: $ => $._wordContent,

	extras: $ => [' ', '\t'],

	inline: $ => [$._terminator],

	conflicts: $ => [[$.Word]],

	rules: {
		Program: $ => seq(
			repeat(
				seq(
					optional(
						$._statement
					), $._terminator
				)
			),
			optional(
				$._statement
			)
		),
		_statement: $ => choice(
			$.Comment,
			$.Command
		),
		_terminator: $ => choice(
			'\n',
			';'
		),
		Comment: $ => /#[^\n]+/,
		Command: $ => seq(
			field(
				'name',
				$._word
			),
			optional(
				field(
					'arguments',
					$.WordList
				)
			)
		),
		WordList: $ => repeat1($._word),
		_word: $ => choice(
			$.Word,
			$.QuotedWord,
			$.ConcatenatedWord,
			$.Block,
			$.ParenthesizedExpression,
			$.EvaluatedExpression,
			$.EvaluatedBlock,
		),
		Word: $ => sepSeq1(
			choice(
				$._wordContent,
				$.EscapeSequence
			),
			prec.dynamic(
				1,
				$._concat
			)
		),
		_wordContent: $ => /[^$\s\\\(){};""]+/,
		EscapeSequence: $ => /\\./,
		QuotedWord: $ => seq(
			'"',
			repeat1(
				choice(
					$._quotedWordContent,
					$.EvaluatedExpression,
					$.EvaluatedBlock,
					$.EscapeSequence
				)
			),
			'"'
		),
		_quotedWordContent: $ => /[^$\\\()"]+/,
		ConcatenatedWord: $ => sepSeq2(
			choice(
				$.Word,
				$.ParenthesizedExpression
			),
			$._concat
		),
		Block: $ => seq(
			'{',
			statementSeq,
			'}'
		),
		EvaluatedExpression: $ => seq(
			'$',
			$.ParenthesizedExpression
		),
		EvaluatedBlock: $ => seq(
			'$',
			$.Block
		),
		Expression: $ => $._expression,
		_expression: $ => choice(
			$.VariableExpression,
			$.NumberExpression,
			$._binaryExpression,
			$.ParenthesizedExpression
		),
		VariableExpression: $ => $.Word,
		NumberExpression: $ => /[-+]?([0-9]*\.)?[0-9]+/,
		_binaryExpression: $ => choice(
			$.ExponentExpression,
			$.MultiplicationExpression,
			$.DivisionExpression,
			$.AdditionExpression,
			$.SubtractionExpression,
			$._relationalExpression,
			$._equalityExpression
		),
		ExponentExpression: $ => binaryExpression($, "exponent", '**'),
		MultiplicationExpression: $ => binaryExpression($, "multiplicative", '*'),
		DivisionExpression: $ => binaryExpression($, "multiplicative", '/'),
		AdditionExpression: $ => binaryExpression($, "additive", '+'),
		SubtractionExpression: $ => binaryExpression($, "additive", '-'),
		_relationalExpression: $ => choice(
			$.LessThanExpression,
			$.LessThanOrEqualToExpression,
			$.GreaterThanExpression,
			$.GreaterThanOrEqualToExpression
		),
		LessThanExpression: $ => binaryExpression($, "relational", '<'),
		LessThanOrEqualToExpression: $ => binaryExpression($, "relational", '<='),
		GreaterThanExpression: $ => binaryExpression($, "relational", '>'),
		GreaterThanOrEqualToExpression: $ => binaryExpression($, "relational", '>='),
		_equalityExpression: $ => choice(
			$.EqualToExpression,
			$.NotEqualToExpression
		),
		EqualToExpression: $ => binaryExpression($, "equality", '=='),
		NotEqualToExpression: $ => binaryExpression($, "equality", '!='),
		ParenthesizedExpression: $ => seq(
			'(',
			$.Expression,
			')'
		)
	}
});

function binaryExpression($, precedence, operator) {
	return prec.left(
		precedence,
		seq(
			field(
				"left",
				$._expression
			),
			operator,
			field(
				'right',
				$._expression
			)
		)
	);
}

function sepSeq(rule, separator) {
	return optional(
		seq(
			rule,
			repeat(
				seq(
					separator,
					rule
				)
			)
		)
	);
}

function sepSeq1(rule, separator) {
	return seq(
		rule,
		repeat(
			seq(
				separator,
				rule
			)
		)
	);
}

function sepSeq2(rule, separator) {
	return seq(
		rule,
		repeat1(
			seq(
				separator,
				rule
			)
		)
	);
}