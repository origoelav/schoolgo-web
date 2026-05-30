import * as fs from 'fs';

const content = fs.readFileSync('src/pages/SchoolGoAdmin.tsx', 'utf8');

// Vamos procurar por trechos que mostrem erro ao adicionar motorista ou criar motorista
const matches: string[] = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('motorista') || line.includes('Motorista') || line.includes('aplicativo') || line.includes('App')) {
    matches.push(`${index + 1}: ${line.trim()}`);
  }
});

console.log(`Total matches: ${matches.length}`);
console.log(matches.slice(0, 100).join('\n'));
