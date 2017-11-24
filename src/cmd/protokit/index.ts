// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as banner from 'govuk/cmd/protokit/banner'
import * as cmdgroup from 'govuk/cmd/protokit/cmdgroup'
import * as cmdinit from 'govuk/cmd/protokit/cmdinit'
import * as cmdnew from 'govuk/cmd/protokit/cmdnew'
import * as cmdrun from 'govuk/cmd/protokit/cmdrun'
import * as cmdsnapshot from 'govuk/cmd/protokit/cmdsnapshot'
import * as log from 'govuk/log'
import * as optparse from 'govuk/optparse'
import * as path from 'path'

const COMMANDS: {[key: string]: (args: optparse.Args) => void} = {
	group: cmdgroup.main,
	init: cmdinit.main,
	new: cmdnew.main,
	run: cmdrun.main,
	snapshot: cmdsnapshot.main,
}

const INFO: {[key: string]: string} = {
	group: cmdgroup.INFO,
	init: cmdinit.INFO,
	new: cmdnew.INFO,
	run: cmdrun.INFO,
	snapshot: cmdsnapshot.INFO,
}

const FLAGS: {[key: string]: string} = {
	run: cmdrun.FLAGS,
}

function cmdhelp(args: string[]) {
	if (!args.length) {
		printUsage()
		return
	}
	const cmd = args[0]
	const info = INFO[cmd]
	if (!info) {
		unknown(cmd)
		process.exit(1)
	}
	const flags = FLAGS[cmd]
	console.log(banner.LOGO)
	console.log(`Usage: protokit ${cmd}${flags ? ' [OPTIONS]' : ''}\n`)
	if (flags) {
		console.log('Options:')
		console.log(flags)
	}
	console.log(`This command will ${info}.`)
}

function printUsage() {
	console.log(banner.LOGO)
	console.log('Usage: protokit COMMAND [OPTIONS]\n')
	console.log('Available commands:\n')
	for (const cmd of Object.keys(COMMANDS).sort()) {
		console.log(`      ${cmd.padEnd(12)}${INFO[cmd]}`)
	}
	console.log('')
}

function printVersion() {
	const modpath = require.resolve('govuk/cmd/protokit')
	const root = path.dirname(path.dirname(path.dirname(path.dirname(modpath))))
	const manifest = path.join(root, 'package.json')
	console.log(require(manifest).version)
}

function unknown(cmd: string) {
	log.error(`protokit: unknown command: "${cmd}"`)
}

// `main` runs the protokit command with the given args.
export function main(argv: string[]) {
	const args = optparse.Args.from(argv.slice(3))
	const cmd = argv[2]
	switch (cmd) {
		case undefined:
		case '-h':
		case '--help':
			printUsage()
			process.exit()
		case 'help':
			cmdhelp(args)
			process.exit()
		case 'version':
		case '-v':
		case '--version':
			printVersion()
			process.exit()
	}
	const handler = COMMANDS[cmd]
	if (!handler) {
		unknown(cmd)
		process.exit(1)
	}
	if (args.includes('-h') || args.includes('--help')) {
		cmdhelp([cmd])
		process.exit()
	}
	handler(args)
}
