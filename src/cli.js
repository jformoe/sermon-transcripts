#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const { program } = require('commander');
const { convertTranscriptToHtml } = require('./converter');

program
    .name('transcript-to-html')
    .description('Convert a text transcript to a styled HTML file')
    .argument('<file>', 'Input text file in the /data directory');

program.parse(process.argv);
const [inputFile] = program.args;

async function main() {
    try {
        const inputPath = path.resolve(inputFile);
        const stat = await fs.stat(inputPath);
        if (!stat.isFile()) {
            throw new Error(`Input path is not a file: ${inputPath}`);
        }

        const rawText = await fs.readFile(inputPath, 'utf8');
        const filenameBase = path.basename(inputPath, path.extname(inputPath));
        
        const html = await convertTranscriptToHtml(rawText, filenameBase);

        const outDir = path.resolve(process.cwd(), 'output');
        await fs.mkdir(outDir, { recursive: true });

        const outPath = path.join(outDir, `${filenameBase}.html`);
        await fs.writeFile(outPath, html, 'utf8');
        
        console.log(`✅ Successfully converted ${filenameBase} to HTML at output/${filenameBase}.html`);
    } catch (error) {
        console.error(`❌ Error processing file: ${error.message}`);
        process.exit(1);
    }
}

main();
