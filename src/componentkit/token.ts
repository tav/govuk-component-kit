// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! Package token defines the various token types.

enum token {
	HTML_ATTR,
	HTML_COMMENT_START,
	HTML_COMMENT_END,
	HTML_TAG,
	HTML_TAG_CLOSE_LEFT_DELIMITER,
	HTML_TAG_CLOSE_RIGHT_DELIMITER,
	HTML_TAG_OPEN_LEFT_DELIMITER,
	HTML_TAG_OPEN_RIGHT_DELIMITER,
	TEXT,
}

export default token
