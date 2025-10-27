#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要修复的导入映射
const importMappings = [
  { from: "../../../stores", to: "../../stores" },
  { from: "../../../services/", to: "../../services/" },
  { from: "../../../components/", to: "../../components/" },
  { from: "../../../utils/", to: "../../utils/" },
  { from: "../../../types/", to: "../../types/" },
  { from: "../../../hooks/", to: "../../hooks/" },
  { from: "../../../pages/", to: "../../pages/" },
  { from: "../../mocks/data", to: "../mocks/data" },
];

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    importMappings.forEach(mapping => {
      const regex = new RegExp(mapping.from.replace(/\//g, '\\/'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, mapping.to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath);
      }
    } else if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
      fixImportsInFile(filePath);
    }
  });
}

// 开始修复
const testDir = path.join(__dirname, 'src', 'tests');
console.log('Fixing test file imports...');
walkDirectory(testDir);
console.log('Done!');