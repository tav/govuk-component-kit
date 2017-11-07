// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The terminal module provides support functionality for writing to stdout.

// `SupportsColor` indicates whether the output is likely to display color, i.e.
// if the current process is being run within a text terminal (TTY) context in a
// terminal emulator that supports 256 colors.
export const SupportsColor =
	Boolean(process.stdout.isTTY) && /-256(color)?$/i.test(process.env.TERM || '')
