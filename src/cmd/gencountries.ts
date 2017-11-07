// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The gencountries module implements support for generating countries/data.

import * as https from 'https'

const SOURCE_URL = 'https://country.register.gov.uk/records.tsv?page-size=5000'

function exit(msg: string) {
	console.log('ERROR:', msg)
	process.exit(1)
}

function parse(input: string) {
	const data = []
	for (let line of input.split('\n')) {
		line = line.trim()
		if (!line) {
			continue
		}
		const cols = line.split('\t')
		// Ignore header and countries which have been removed from the list.
		if (cols[9]) {
			continue
		}
		// Sanity check that the duplicated key column is still there.
		if (cols[3] !== cols[4]) {
			exit(`column value "${cols[3]}" does not match "${cols[4]}"`)
		}
		data.push([cols[3], cols[5], cols[6], cols[7]])
	}
	data.sort((a, b) => {
		if (a[0] > b[0]) {
			return 1
		} else {
			return -1
		}
	})
	return data
}

export function main() {
	https
		.get(SOURCE_URL, resp => {
			let data = ''
			resp.on('data', chunk => {
				data += chunk
			})
			resp.on('end', () => {
				console.log(parse(data))
			})
		})
		.on('error', err => {
			exit(err.message)
		})
}
