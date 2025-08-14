#!/usr/bin/env node

/**
 * Script para remover completamente o Supabase do projeto
 * Execute com: node scripts/remove-supabase.js
 */

const fs = require('fs');
const path = require('path');

console.log('🗑️  Iniciando remoção completa do Supabase...\n');

// Lista de arquivos que contêm referências ao Supabase
const filesToCheck = [
  'src/services/supabase.ts',
  'src/api/entities.js',
  'src/utils/fixClientsLoad.js',
  'src/utils/diagnosticClients.js',
  'src/utils/testRegistration.js',
  'src/utils/testClients.js',
  'src/pages/Clients.jsx',
  'src/pages/Factures.tsx',
  'src/contexts/AuthContext.tsx'
];

// Lista de arquivos para remover completamente
const filesToRemove = [
  'src/services/supabase.ts',
  'src/api/entities.js',
  'src/utils/fixClientsLoad.js',
  'src/utils/diagnosticClients.js',
  'src/utils/testRegistration.js',
  'src/utils/testClients.js'
];

// Lista de dependências para remover do package.json
const dependenciesToRemove = [
  '@supabase/supabase-js',
  '@supabase/auth-helpers-react',
  '@supabase/auth-helpers-nextjs'
];

// Função para remover arquivos
function removeFiles() {
  console.log('📁 Removendo arquivos do Supabase...');
  
  let removedCount = 0;
  
  filesToRemove.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removido: ${filePath}`);
        removedCount++;
      } catch (error) {
        console.error(`❌ Erro ao remover ${filePath}:`, error.message);
      }
    } else {
      console.log(`ℹ️  Arquivo não encontrado: ${filePath}`);
    }
  });
  
  console.log(`📊 Total de arquivos removidos: ${removedCount}\n`);
  return removedCount;
}

// Função para remover dependências do package.json
function removeDependencies() {
  console.log('📦 Removendo dependências do Supabase...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json não encontrado');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let removedCount = 0;
    
    // Remover das dependências
    if (packageJson.dependencies) {
      dependenciesToRemove.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          delete packageJson.dependencies[dep];
          console.log(`✅ Removida dependência: ${dep}`);
          removedCount++;
        }
      });
    }
    
    // Remover das devDependencies
    if (packageJson.devDependencies) {
      dependenciesToRemove.forEach(dep => {
        if (packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
          console.log(`✅ Removida devDependency: ${dep}`);
          removedCount++;
        }
      });
    }
    
    // Salvar package.json atualizado
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log(`📊 Total de dependências removidas: ${removedCount}\n`);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar package.json:', error.message);
    return false;
  }
}

// Função para atualizar arquivos que ainda contêm referências ao Supabase
function updateFiles() {
  console.log('🔧 Atualizando arquivos com referências ao Supabase...');
  
  let updatedCount = 0;
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        // Remover imports do Supabase
        content = content.replace(/import\s+.*supabase.*\s+from\s+['"]@supabase\/[^'"]+['"];?\n?/gi, '');
        content = content.replace(/import\s+.*supabase.*\s+from\s+['"]\.\.\/services\/supabase['"];?\n?/gi, '');
        content = content.replace(/import\s+.*supabase.*\s+from\s+['"]\.\/supabase['"];?\n?/gi, '');
        
        // Remover uso do supabase
        content = content.replace(/supabase\./g, '// TODO: Substituir por SQLite - ');
        content = content.replace(/await\s+supabase\./g, '// TODO: Substituir por SQLite - await ');
        
        // Se o conteúdo mudou, salvar o arquivo
        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content);
          console.log(`✅ Atualizado: ${filePath}`);
          updatedCount++;
        } else {
          console.log(`ℹ️  Sem alterações: ${filePath}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
      }
    }
  });
  
  console.log(`📊 Total de arquivos atualizados: ${updatedCount}\n`);
  return updatedCount;
}

// Função para criar arquivo de instruções
function createInstructions() {
  console.log('📝 Criando arquivo de instruções...');
  
  const instructions = `# 🗑️ Remoção do Supabase - Instruções

## ✅ O que foi feito automaticamente:

1. **Arquivos removidos:**
   - src/services/supabase.ts
   - src/api/entities.js
   - src/utils/fixClientsLoad.js
   - src/utils/diagnosticClients.js
   - src/utils/testRegistration.js
   - src/utils/testClients.js

2. **Dependências removidas:**
   - @supabase/supabase-js
   - @supabase/auth-helpers-react
   - @supabase/auth-helpers-nextjs

3. **Arquivos atualizados:**
   - Referências ao Supabase foram comentadas com TODO

## 🔧 Próximos passos manuais:

1. **Instalar dependências atualizadas:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Substituir funcionalidades do Supabase por SQLite:**
   - Usar sqliteService em vez de supabase
   - Atualizar AuthContext para usar SQLite
   - Atualizar páginas para usar SQLite

3. **Testar a aplicação:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Verificar se não há mais erros de build:**
   \`\`\`bash
   npm run build
   \`\`\`

## 📁 Estrutura atual:

- ✅ **SQLite implementado:** src/services/sqlite.service.ts
- ✅ **Migração implementada:** src/services/migration.service.ts
- ✅ **Painel de migração:** src/components/MigrationPanel.tsx
- 🗑️ **Supabase removido:** Todos os arquivos e dependências

## 🎯 Benefícios:

- ✅ **Independência total** do Supabase
- ✅ **Dados persistentes** localmente
- ✅ **Funciona offline**
- ✅ **Sem custos** de API
- ✅ **Performance superior**

## ⚠️ Importante:

- Faça backup dos dados antes de executar este script
- Teste a aplicação após cada alteração
- Use o painel de migração para transferir dados existentes
`;

  const instructionsPath = path.join(process.cwd(), 'SUPABASE-REMOVAL-INSTRUCTIONS.md');
  
  try {
    fs.writeFileSync(instructionsPath, instructions);
    console.log('✅ Arquivo de instruções criado: SUPABASE-REMOVAL-INSTRUCTIONS.md\n');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar arquivo de instruções:', error.message);
    return false;
  }
}

// Função principal
function main() {
  console.log('🚀 Iniciando processo de remoção do Supabase...\n');
  
  // 1. Remover arquivos
  const filesRemoved = removeFiles();
  
  // 2. Remover dependências
  const depsRemoved = removeDependencies();
  
  // 3. Atualizar arquivos restantes
  const filesUpdated = updateFiles();
  
  // 4. Criar instruções
  const instructionsCreated = createInstructions();
  
  // Resumo final
  console.log('🎯 RESUMO DA REMOÇÃO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Arquivos removidos: ${filesRemoved}`);
  console.log(`📦 Dependências removidas: ${depsRemoved ? 'Sim' : 'Não'}`);
  console.log(`🔧 Arquivos atualizados: ${filesUpdated}`);
  console.log(`📝 Instruções criadas: ${instructionsCreated ? 'Sim' : 'Não'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (depsRemoved) {
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Execute: npm install');
    console.log('2. Teste: npm run build');
    console.log('3. Use o painel de migração para transferir dados');
    console.log('4. Substitua funcionalidades do Supabase por SQLite\n');
  }
  
  console.log('✅ Remoção do Supabase concluída!');
  console.log('📖 Consulte SUPABASE-REMOVAL-INSTRUCTIONS.md para detalhes');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, removeFiles, removeDependencies, updateFiles, createInstructions };
