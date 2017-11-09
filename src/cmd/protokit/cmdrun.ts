// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as log from 'govuk/log'
import * as optparse from 'govuk/optparse'
import * as server from 'govuk/web/server'

export const INFO = 'run the protokit server'
export const FLAGS = `
-p, --port      specify the port to run on [8080]
`

function getDefaultPort() {
	const port = parseInt(process.env.PORT || '', 10)
	if (isNaN(port)) {
		return 9000
	}
	return port
}

export async function main(args: optparse.Args) {
	const port = args.getNumber(getDefaultPort(), '-p', '--port')
	const host = args.get('--host')
	const err = await server.run(port, host)
	if (err) {
		log.error(err)
		process.exit(1)
	}
	log.info(
		`>> Protokit server is running on http://${host || 'localhost'}:${port}`
	)
}
