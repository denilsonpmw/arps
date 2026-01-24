import { syncFromExemploOutroSite } from '../services/syncService';

async function testSync() {
  console.log('=== TESTANDO SINCRONIZAÇÃO LOCALMENTE ===\n');
  await syncFromExemploOutroSite();
  console.log('\n=== FIM DO TESTE ===');
  process.exit(0);
}

testSync().catch(console.error);
