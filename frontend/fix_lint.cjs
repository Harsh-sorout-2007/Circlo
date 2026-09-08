const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(p => {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/import React, \{\s*/g, 'import { ');
  content = content.replace(/import React from 'react';\r?\n/g, '');
  content = content.replace(/import React from "react";\r?\n/g, '');
  fs.writeFileSync(p, content);
});
