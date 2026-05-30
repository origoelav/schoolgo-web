const fs = require('fs');

const filePath = 'src/context/AppContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const normalizedContent = content.replace(/\r\n/g, '\n');

const target = `        }
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, []);`;

const replacement = `        }
      }
    }
  } finally {
    setIsProfileLoading(false);
  }
}, []);`;

if (normalizedContent.includes(target)) {
  const updated = normalizedContent.replace(target, replacement);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log("SUCCESS: Syntax error fixed!");
} else {
  console.log("FAILED: Target block not found.");
}
