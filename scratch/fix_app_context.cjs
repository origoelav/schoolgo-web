const fs = require('fs');

const filePath = 'src/context/AppContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Add state variable inside AppProvider
const stateTarget = `  const [authLoading, setAuthLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus>('trial');`;

const stateReplacement = `  const [authLoading, setAuthLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus>('trial');
  const [isProfileLoading, setIsProfileLoading] = useState(false);`;

// 2. Add reset state update
const resetTarget = `  const resetState = useCallback(() => {
    setSession(null);
    setIsAdmin(false);
    setIsMaster(false);
    setIsClientAdmin(false);
    setProfile(null);
    setUserStatus('trial');
  }, []);`;

const resetReplacement = `  const resetState = useCallback(() => {
    setSession(null);
    setIsAdmin(false);
    setIsMaster(false);
    setIsClientAdmin(false);
    setProfile(null);
    setUserStatus('trial');
    setIsProfileLoading(false);
  }, []);`;

// 3. Wrap fetchProfile body in try-finally
const fetchStartTarget = `  const fetchProfile = useCallback(async (userId: string, email: string, userCreatedAt?: string) => {
    const activeSupabase = getActiveSupabase();`;

const fetchStartReplacement = `  const fetchProfile = useCallback(async (userId: string, email: string, userCreatedAt?: string) => {
    setIsProfileLoading(true);
    try {
      const activeSupabase = getActiveSupabase();`;

const fetchEndTarget = `      }
    }
  }, []);`;

const fetchEndReplacement = `      }
    } finally {
      setIsProfileLoading(false);
    }
  }, []);`;

// 4. Remove computed isProfileLoading
const computedTarget = `  const isProfileLoading = !!session && (!profile || profile.user_id !== session.user.id);`;
const computedReplacement = ``;

let updated = normalizedContent;

if (updated.includes(stateTarget)) {
  updated = updated.replace(stateTarget, stateReplacement);
  console.log("State variable injection: SUCCESS");
} else {
  console.log("State variable injection: FAILED");
}

if (updated.includes(resetTarget)) {
  updated = updated.replace(resetTarget, resetReplacement);
  console.log("Reset state injection: SUCCESS");
} else {
  console.log("Reset state injection: FAILED");
}

if (updated.includes(fetchStartTarget)) {
  updated = updated.replace(fetchStartTarget, fetchStartReplacement);
  console.log("FetchProfile start injection: SUCCESS");
} else {
  console.log("FetchProfile start injection: FAILED");
}

if (updated.includes(fetchEndTarget)) {
  updated = updated.replace(fetchEndTarget, fetchEndReplacement);
  console.log("FetchProfile end injection: SUCCESS");
} else {
  console.log("FetchProfile end injection: FAILED");
}

if (updated.includes(computedTarget)) {
  updated = updated.replace(computedTarget, computedReplacement);
  console.log("Computed property removal: SUCCESS");
} else {
  console.log("Computed property removal: FAILED");
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log("FINISHED updating AppContext.tsx");
