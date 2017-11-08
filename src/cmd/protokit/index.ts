// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import {Logo} from 'govuk/cmd/protokit/banner'
import {dirname, join} from 'path'

const commands: {[key: string]: (args: string[]) => void} = {
	init: cmdInit,
	new: cmdNew,
	run: cmdRun,
}

const help: {[key: string]: string} = {
	init: 'create an empty protokit repo',
	new: 'create a new prototype path/journey',
	run: 'run the protokit server',
}

const detailed: {[key: string]: string} = {
	run: `
    -p, --port      specify the port to run on [8080]
`,
}

function cmdHelp(args: string[]) {
	if (!args.length) {
		printUsage()
		return
	}
	const cmd = args[0]
	const usage = help[cmd]
	if (!usage) {
		unknownCmd(cmd)
		process.exit(1)
	}
	const options = detailed[cmd]
	console.log(Logo)
	console.log(`Usage: protokit ${cmd}${options ? ' [OPTIONS]' : ''}\n`)
	if (options) {
		console.log('Options:')
		console.log(options)
	}
	console.log(`This command will ${usage}.`)
}

function cmdInit(args: string[]) {}

function cmdNew(args: string[]) {}

function cmdRun(args: string[]) {
	const port = getPort(args, '-p') || getPort(args, '--port') || 8080
	console.log(port)
}

function getPort(args: string[], param: string) {
	const idx = args.indexOf(param)
	if (idx === -1) {
		return
	}
	const arg = args[idx + 1]
	if (!arg) {
		return
	}
	const port = parseInt(arg, 10)
	if (isNaN(port)) {
		return
	}
	return port
}

function printUsage() {
	console.log(Logo)
	console.log('Usage: protokit COMMAND [OPTIONS]\n')
	console.log('Available commands:\n')
	for (const cmd of Object.keys(commands).sort()) {
		console.log(`      ${cmd}\t${help[cmd]}`)
	}
	console.log('')
}

function printVersion() {
	const modpath = require.resolve('govuk/cmd/protokit')
	const root = dirname(dirname(dirname(dirname(modpath))))
	const manifest = join(root, 'package.json')
	console.log(require(manifest).version)
}

function unknownCmd(cmd: string) {
	console.log(`ERROR: Unknown protokit command: "${cmd}"`)
}

// `main` runs the protokit command with the given args.
export function main(argv: string[]) {
	const args = argv.slice(3)
	const cmd = argv[2]
	switch (cmd) {
		case undefined:
		case '-h':
		case '--help':
			printUsage()
			process.exit()
		case 'help':
			cmdHelp(args)
			process.exit()
		case 'version':
		case '-v':
		case '--version':
			printVersion()
			process.exit()
	}
	const handler = commands[cmd]
	if (!handler) {
		unknownCmd(cmd)
		process.exit(1)
	}
	if (args.includes('-h') || args.includes('--help')) {
		cmdHelp([cmd])
		process.exit()
	}
	handler(args)
}
