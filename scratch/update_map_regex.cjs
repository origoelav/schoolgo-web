const fs = require('fs');

const filePath = 'src/components/SchoolMap.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');

const newStudentBlock = `const isCompleted = student.status === 'delivered' || student.status === 'collected';
            const isAbsent = student.isAbsent || student.status === 'not_delivered';
            const bgColor = isAbsent ? '#ef4444' : isCompleted ? '#475569' : '#1e293b';
            const initial = (student.name || 'A').charAt(0).toUpperCase();
            const opacity = isCompleted ? '0.35' : isAbsent ? '0.6' : '1.0';
            const firstName = (student.name?.split(' ')[0] || 'ALUNO').toUpperCase();
            const driverColor = getDriverColor(student.driver_id || student.user_id, drivers);
            
            el.innerHTML = \`
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: \${opacity}; transition: opacity 0.5s ease; position: relative;">
                  <div style="position: relative; width: 34px; height: 34px;">
                      <div style="background: \${bgColor}; border: 2px solid white; border-radius: 50%; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); overflow: hidden;">
                          \${(student.fotoUrl && student.fotoUrl !== "" && student.fotoUrl !== "null") ? \`<img src="\${student.fotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />\` : \`<span style="color: white; font-size: 14px; font-weight: 900; font-family: sans-serif;">\${initial}</span>\`}
                      </div>
                      <div style="position: absolute; bottom: -1px; right: -1px; width: 11px; height: 11px; background: \${driverColor}; border: 1.5px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 2;"></div>
                  </div>
                  <div style="background: rgba(15, 23, 42, 0.9); color: #e2e8f0; padding: 2px 6px 2px 4px; border-radius: 4px; font-weight: 900; font-size: 8px; text-transform: uppercase; margin-top: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.25); white-space: nowrap; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); border-left: 3px solid \${driverColor}; letter-spacing: 0.5px;">
                      \${firstName}
                  </div>
              </div>
            \`;`;

// Regex matches from const isCompleted to the ending backtick of el.innerHTML
const studentRegex = /const isCompleted = student\.status === 'delivered'[\s\S]+?el\.innerHTML = `[\s\S]+?`;/;

if (studentRegex.test(normalizedContent)) {
  const updatedContent = normalizedContent.replace(studentRegex, newStudentBlock);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Student marker visual block replaced successfully using regex.");
} else {
  console.error("Student regex did not match!");
}
