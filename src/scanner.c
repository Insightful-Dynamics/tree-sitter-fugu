#include <tree_sitter/parser.h>
#include <wctype.h>

void *tree_sitter_fugu_external_scanner_create()
{
	return NULL;
}

void tree_sitter_fugu_external_scanner_destroy(void *p) {}

void tree_sitter_fugu_external_scanner_reset(void *p) {}

unsigned tree_sitter_fugu_external_scanner_serialize(void *p, char *buffer)
{
	return 0;
}

void tree_sitter_fugu_external_scanner_deserialize(
		void *payload,
		const char *state,
		unsigned length) {}

enum TokenType
{
	CONCAT,
	CLOSING_BRACE,
	CLOSING_PARENTHESIS,
};

static bool is_end_of_file_ahead(TSLexer *lexer)
{
	return lexer->lookahead == 0;
}

static bool is_whitespace_ahead(TSLexer *lexer)
{
	return iswspace(lexer->lookahead);
}

static bool is_character_ahead(TSLexer *lexer, char character)
{
	return lexer->lookahead == character;
}

static bool is_concat_valid(TSLexer *lexer, const bool *valid_symbols)
{
	const int32_t lookahead = lexer->lookahead;

	if (lookahead == 0)
	{
		return false;
	}

	if (iswspace(lookahead))
	{
		return false;
	}

	if (lookahead == '}' && valid_symbols[CLOSING_BRACE])
	{
		return false;
	}

	if (lookahead == ')' && valid_symbols[CLOSING_PARENTHESIS])
	{
		return false;
	}

	if (lookahead == ';')
	{
		return false;
	}

	return valid_symbols[CONCAT];
}

bool tree_sitter_fugu_external_scanner_scan(
		void *payload,
		TSLexer *lexer,
		const bool *valid_symbols)
{
	if (is_concat_valid(lexer, valid_symbols))
	{
		lexer->result_symbol = CONCAT;
		return true;
	}

	return false;
}