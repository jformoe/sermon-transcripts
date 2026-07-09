const fs = require('fs/promises');
const path = require('path');
const { convertTranscriptToHtml } = require('./src/converter');

async function processAll() {
    const inputDir = path.join(__dirname, 'data', 'new');
    const outDir = path.join(__dirname, 'output');
    
    try {
        await fs.mkdir(outDir, { recursive: true });
        
        const files = await fs.readdir(inputDir);
        const txtFiles = files.filter(f => f.endsWith('.txt'));
        
        if (txtFiles.length === 0) {
            console.log('No .txt files found in data/new/');
            return;
        }

        console.log(`Found ${txtFiles.length} files to process in data/new/`);

        for (const file of txtFiles) {
            try {
                const inputPath = path.join(inputDir, file);
                const rawText = await fs.readFile(inputPath, 'utf8');
                const filenameBase = path.basename(file, '.txt');
                
                const html = await convertTranscriptToHtml(rawText, filenameBase);
                
                const outPath = path.join(outDir, `${filenameBase}.html`);
                await fs.writeFile(outPath, html, 'utf8');
                
                console.log(`✅ Processed: ${file} -> output/${filenameBase}.html`);
            } catch (err) {
                console.error(`❌ Failed to process ${file}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error(`Failed to read directory ${inputDir}: ${err.message}`);
    }
}

processAll();
