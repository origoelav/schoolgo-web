import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Corrigir o bloco handleSaveDisplayName que está sem catch
const targetRegex = /const\s+handleSaveDisplayName\s*=\s*async\s*\(\)\s*=>\s*\{\s*if\s*\(!editDisplayName\.trim\(\)\)\s*\{\s*toast\.error\("O nome não pode ficar vazio\."\);\s*return;\s*\}\s*try\s*\{\s*const\s*\{\s*error\s*\}\s*=\s*await\s+supabase\s*\.from\('profiles'\)\s*\.update\(\{\s*display_name:\s*editDisplayName\s*\}\)\s*\.eq\('user_id',\s*dbProfile\.user_id\);\s*if\s*\(error\)\s*throw\s+error;\s*toast\.success\("Nome atualizado com sucesso!"\);\s*fetchData\(\);\s*\}\s*\};/gi;

if (targetRegex.test(content)) {
  console.log("Found handleSaveDisplayName missing catch! Fixing it...");
  content = content.replace(targetRegex, () => {
    return `const handleSaveDisplayName = async () => {
    if (!editDisplayName.trim()) {
      toast.error("O nome não pode ficar vazio.");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: editDisplayName })
        .eq('user_id', dbProfile.user_id);

      if (error) throw error;
      toast.success("Nome atualizado com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar o nome: " + error.message);
    }
  };`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully fixed the catch block!");
} else {
  console.log("Did not match handleSaveDisplayName missing catch with regex. Let's do a substring replace...");
  const searchStr = `      toast.success("Nome atualizado com sucesso!");
      fetchData();
    }
  };`;
  
  // Vamos tentar substituir com replace de strings com suporte a \r\n
  const lfSearchStr = searchStr.replace(/\r?\n/g, '\n');
  const crlfSearchStr = searchStr.replace(/\r?\n/g, '\r\n');
  
  if (content.includes(crlfSearchStr)) {
    console.log("Found target with CRLF! Replacing...");
    content = content.replace(crlfSearchStr, `      toast.success("Nome atualizado com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar o nome: " + error.message);
    }
  };`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("CRLF Replacement successful!");
  } else if (content.includes(lfSearchStr)) {
    console.log("Found target with LF! Replacing...");
    content = content.replace(lfSearchStr, `      toast.success("Nome atualizado com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar o nome: " + error.message);
    }
  };`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("LF Replacement successful!");
  } else {
    console.log("Could not find the target search string in the file.");
  }
}
