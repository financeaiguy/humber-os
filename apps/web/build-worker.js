const fs = require('fs')
const path = require('path')

// Simple build script to prepare worker files
console.log('Building Workers deployment...')

// Copy the worker file to dist
const workerSource = fs.readFileSync('./src/worker-complete-fixed.js', 'utf8')

// Update import paths to work with the compiled structure
const updatedWorker = workerSource.replace(
  "const { renderApp } = await import('./workers-app')",
  "const { renderApp } = await import('./workers-app.js')"
)

// Ensure dist directory exists
if (!fs.existsSync('./dist-worker')) {
  fs.mkdirSync('./dist-worker', { recursive: true })
}

// Write the updated worker file
fs.writeFileSync('./dist-worker/worker.js', updatedWorker)

console.log('✅ Worker build complete!')
console.log('📦 Files ready for deployment in ./dist-worker/')
