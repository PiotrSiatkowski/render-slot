import { execFileSync } from 'node:child_process'
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'render-slot-consumer-'))
const fixture = join(temporaryDirectory, 'fixture')
const npm = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm'
const npmPrefix = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm.cmd'] : []

function run(command, args, cwd = fixture) {
	execFileSync(command, args, {
		cwd,
		stdio: 'inherit',
	})
}

try {
	const packResult = execFileSync(
		npm,
		[
			...npmPrefix,
			'pack',
			'--json',
			'--ignore-scripts',
			'--pack-destination',
			temporaryDirectory,
		],
		{
			cwd: root,
			encoding: 'utf8',
		}
	)
	const [{ filename }] = JSON.parse(packResult)
	const packageArchive = join(temporaryDirectory, filename)

	mkdirSync(fixture)
	writeFileSync(
		join(fixture, 'package.json'),
		JSON.stringify({ name: 'render-slot-consumer-test', private: true, type: 'module' })
	)
	run(npm, [
		...npmPrefix,
		'install',
		packageArchive,
		'--ignore-scripts',
		'--legacy-peer-deps',
		'--no-package-lock',
	])

	symlinkSync(join(root, 'node_modules', 'react'), join(fixture, 'node_modules', 'react'), 'junction')
	mkdirSync(join(fixture, 'node_modules', '@types'), { recursive: true })
	symlinkSync(
		join(root, 'node_modules', '@types', 'react'),
		join(fixture, 'node_modules', '@types', 'react'),
		'junction'
	)

	writeFileSync(
		join(fixture, 'esm.mjs'),
		`import { renderSlot } from 'render-slot'
if (renderSlot('esm') !== 'esm') throw new Error('ESM import failed')
`
	)
	writeFileSync(
		join(fixture, 'commonjs.cjs'),
		`const { renderSlot } = require('render-slot')
if (renderSlot('commonjs') !== 'commonjs') throw new Error('CommonJS require failed')
`
	)
	writeFileSync(
		join(fixture, 'types.ts'),
		`import type { ComponentType } from 'react'
import { type GatewayOptions, type Renderable, renderSlot, useGateway } from 'render-slot'

type SlotProps = { label: string }
type SourceProps = { required: string; renderText?: Renderable<SlotProps> }
declare const Source: ComponentType<SourceProps>

const override: Renderable<SlotProps> = { label: 'typed' }
renderSlot(override, ({ label }) => label)

const options: GatewayOptions<SlotProps> = {
	initialDefault: ({ label }) => label,
}

function typecheckGateway() {
	return useGateway<typeof Source, 'renderText'>(options)
}

void typecheckGateway
`
	)
	writeFileSync(
		join(fixture, 'tsconfig.json'),
		JSON.stringify({
			compilerOptions: {
				module: 'NodeNext',
				moduleResolution: 'NodeNext',
				target: 'ES2020',
				strict: true,
				skipLibCheck: false,
				noEmit: true,
			},
			include: ['types.ts'],
		})
	)

	run(process.execPath, ['esm.mjs'])
	run(process.execPath, ['commonjs.cjs'])
	run(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'])

	const installedPackage = JSON.parse(
		readFileSync(join(fixture, 'node_modules', 'render-slot', 'package.json'), 'utf8')
	)
	if (!installedPackage.exports?.['.']?.import || !installedPackage.exports?.['.']?.require) {
		throw new Error('Published package is missing ESM or CommonJS exports')
	}
	if (!existsSync(join(fixture, 'node_modules', 'render-slot', 'CHANGELOG.md'))) {
		throw new Error('Published package is missing CHANGELOG.md')
	}
} finally {
	rmSync(temporaryDirectory, { recursive: true, force: true })
}
