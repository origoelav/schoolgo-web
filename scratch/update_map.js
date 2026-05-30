const fs = require('fs');

const filePath = 'src/components/SchoolMap.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to avoid CRLF mismatch
const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Target for Student Markers
const oldStudent = `            const isCompleted = student.status === 'delivered' || student.status === 'collected';
            const isAbsent = student.isAbsent || student.status === 'not_delivered';
            const bgColor = isAbsent ? '#ef4444' : isCompleted ? '#64748b' : '#3b82f6';
            const initial = (student.name || 'A').charAt(0).toUpperCase();
            const opacity = isCompleted ? '0.3' : isAbsent ? '0.6' : '1.0';
            const firstName = (student.name?.split(' ')[0] || 'ALUNO').toUpperCase();
            const driverColor = getDriverColor(student.driver_id || student.user_id, drivers);
            
            el.innerHTML = \`
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: \${opacity}; transition: opacity 0.5s ease;">
                  <div style="background: \${bgColor}; border: 3.5px solid \${driverColor}; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); overflow: hidden;">
                      \${(student.fotoUrl && student.fotoUrl !== "" && student.fotoUrl !== "null") ? \`<img src="\${student.fotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />\` : \`<span style="color: white; font-size: 14px; font-weight: 900; font-family: sans-serif;">\${initial}</span>\`}
                  </div>
                  <div style="background: rgba(15, 23, 42, 0.9); color: white; padding: 2px 6px; border-radius: 6px; font-weight: 900; font-size: 8px; text-transform: uppercase; margin-top: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.25); white-space: nowrap; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border: 1.5px solid \${driverColor}; letter-spacing: 0.5px;">
                      \${firstName}
                  </div>
              </div>
            \`;`;

const newStudent = `            const isCompleted = student.status === 'delivered' || student.status === 'collected';
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

// 2. Target for School Markers
const oldSchool = `        el.innerHTML = \`
            <div style="background: #1e1b4b; color: #fbbf24; border: 3px solid #fbbf24; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(251,191,36,0.3); z-index: 10;">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div style="background: rgba(30,27,75,0.9); color: #fbbf24; padding: 4px 10px; border-radius: 8px; font-weight: 900; font-size: 8px; text-transform: uppercase; margin-top: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); white-space: nowrap; backdrop-filter: blur(4px); border: 1.5px solid #fbbf24;">
                \${school.name || 'ESCOLA'}
            </div>
        \`;`;

const newSchool = `        el.innerHTML = \`
            <div style="background: #fbbf24; color: #0f172a; border: 2.5px solid white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(251,191,36,0.5); z-index: 10;">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div style="background: rgba(15, 23, 42, 0.95); color: #fbbf24; padding: 3px 8px; border-radius: 6px; font-weight: 900; font-size: 8px; text-transform: uppercase; margin-top: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); white-space: nowrap; backdrop-filter: blur(4px); border: 1px solid #fbbf24;">
                \${school.name || 'ESCOLA'}
            </div>
        \`;`;

// 3. Target for Driver Markers
const oldDriver = `        el.innerHTML = \`
            <div style="pointer-events: auto; background: \${isOutOfRoute ? '#ef4444' : driverColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 900; white-space: nowrap; margin-bottom: 5px; transform: translateY(-30px); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; background: \${isOnline ? '#22c55e' : '#94a3b8'}; border-radius: 50%; display: inline-block; \${isOnline ? 'animation: map-marker-pulse 1.5s infinite;' : ''}"></span>
                <span>\${driver.name}</span>
                <span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-size: 8px; letter-spacing: 0.5px;">\${driver.vehicle_plate || 'PLACA'}</span>
                \${isOutOfRoute ? '⚠️' : ''}
            </div>
            <div style="pointer-events: auto; width: 50px; height: 50px; background: #0c1220; border-radius: 14px; padding: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 2.5px solid \${driverColor}; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="\${schoolgoLogo}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 5px \${driverColor});" />
            </div>
            \${isOnline ? \`<div style="position: absolute; width: 60px; height: 60px; border: 2px solid \${driverColor}; border-radius: 50%; animation: map-marker-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.3; pointer-events: none;"></div>\` : ''}
        \`;`;

const newDriver = `        el.innerHTML = \`
            <div style="pointer-events: auto; background: rgba(15, 23, 42, 0.95); border: 2px solid \${driverColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 900; white-space: nowrap; margin-bottom: 5px; transform: translateY(-30px); box-shadow: 0 4px 15px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px);">
                <span style="width: 6px; height: 6px; background: \${isOnline ? '#22c55e' : '#94a3b8'}; border-radius: 50%; display: inline-block; \${isOnline ? 'animation: map-marker-pulse 1.5s infinite;' : ''}"></span>
                <span>\${driver.name}</span>
                <span style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 4px; font-size: 8px; letter-spacing: 0.5px; color: \${driverColor}; font-weight: 900;">\${driver.vehicle_plate || 'PLACA'}</span>
                \${isOutOfRoute ? '⚠️' : ''}
            </div>
            <div style="pointer-events: auto; width: 50px; height: 50px; background: #0c1220; border-radius: 14px; padding: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 2.5px solid \${driverColor}; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="\${schoolgoLogo}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 5px \${driverColor});" />
            </div>
            \${isOnline ? \`<div style="position: absolute; width: 60px; height: 60px; border: 2px solid \${driverColor}; border-radius: 50%; animation: map-marker-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.3; pointer-events: none;"></div>\` : ''}
        \`;`;

// Normalize inputs
const norm = (s) => s.replace(/\r\n/g, '\n').trim();

let updated = normalizedContent;

// Replace Student
if (normalizedContent.includes(norm(oldStudent))) {
  updated = updated.replace(norm(oldStudent), norm(newStudent));
  console.log("Student block updated.");
} else {
  console.error("Student block NOT matched.");
}

// Replace School
if (normalizedContent.includes(norm(oldSchool))) {
  updated = updated.replace(norm(oldSchool), norm(newSchool));
  console.log("School block updated.");
} else {
  console.error("School block NOT matched.");
}

// Replace Driver
if (normalizedContent.includes(norm(oldDriver))) {
  updated = updated.replace(norm(oldDriver), norm(newDriver));
  console.log("Driver block updated.");
} else {
  console.error("Driver block NOT matched.");
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log("SchoolMap.tsx visual updates applied successfully!");
