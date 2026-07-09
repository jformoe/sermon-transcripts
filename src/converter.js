const fs = require('fs/promises');
const path = require('path');
const escapeHtml = require('escape-html');

const urlRegex = /(https?:\/\/[^\s]+)/g;

function formatMetadata(metadataText) {
    let escaped = escapeHtml(metadataText);
    escaped = escaped.replace(urlRegex, '<a href="$1">$1</a>');
    return escaped.split('\n').join('<br>\n');
}

function formatBody(bodyText) {
    let escaped = escapeHtml(bodyText);
    const paragraphs = escaped.split(/\n\s*\n/);
    
    return paragraphs
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p>${p.replace(/\n/g, '<br>\n')}</p>`)
        .join('\n');
}

async function convertTranscriptToHtml(rawText, filenameBase) {
    const separatorIndex = rawText.indexOf('---');
    let metadataHtml = '';
    let bodyHtml = '';
    
    if (separatorIndex !== -1) {
        const metadataRaw = rawText.substring(0, separatorIndex).trim();
        const bodyRaw = rawText.substring(separatorIndex + 3).trim();
        metadataHtml = `<div class="metadata">\n${formatMetadata(metadataRaw)}\n</div>`;
        bodyHtml = `<div class="body-text">\n${formatBody(bodyRaw)}\n</div>`;
    } else {
        const titleHtml = `<h1 class="title">${escapeHtml(filenameBase)}</h1>`;
        const bodyRaw = rawText.trim();
        metadataHtml = titleHtml;
        bodyHtml = `<div class="body-text">\n${formatBody(bodyRaw)}\n</div>`;
    }

    const cssPath = path.join(__dirname, '..', 'assets', 'styles.css');
    const cssContent = await fs.readFile(cssPath, 'utf8');

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(filenameBase)}</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${metadataHtml}
${bodyHtml}
</body>
</html>`;

    return fullHtml;
}

module.exports = {
    convertTranscriptToHtml
};
