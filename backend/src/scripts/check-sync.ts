import { prisma } from '../lib/prisma';
import axios from 'axios';

async function checkSync() {
  const API_URL = process.env.WEBHOOK_ARPS_URL;
  const API_KEY = process.env.WEBHOOK_ARPS_KEY;

  console.log('=== DIAGNÓSTICO DE SINCRONIZAÇÃO ===\n');

  // 1. Registros locais
  const totalLocal = await prisma.ata.count();
  const comSourceId = await prisma.ata.count({ where: { source_id: { not: null } } });
  const semSourceId = await prisma.ata.count({ where: { source_id: null } });
  
  console.log('📊 Registros Locais:');
  console.log(`   Total: ${totalLocal}`);
  console.log(`   Com source_id: ${comSourceId}`);
  console.log(`   Sem source_id: ${semSourceId}\n`);

  // 2. Registros na API externa
  if (!API_URL || !API_KEY) {
    console.log('❌ API não configurada');
    return;
  }

  const response = await axios.get(API_URL, {
    headers: { 'x-api-key': API_KEY },
    timeout: 15000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registrosExternos = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
  console.log(`📡 Registros na API Externa: ${registrosExternos.length}\n`);

  // 3. NUPs sem source_id
  const atasSemSourceId = await prisma.ata.findMany({
    where: { source_id: null },
    select: { nup: true, arpNumero: true }
  });

  const nupsExternos = new Set(registrosExternos.map((r: any) => r.nup));
  
  console.log('🔍 Análise dos registros sem source_id:');
  let encontradosNaApi = 0;
  let naoEncontradosNaApi = 0;

  for (const ata of atasSemSourceId) {
    if (nupsExternos.has(ata.nup)) {
      console.log(`   ✅ ${ata.nup} - EXISTE na API (deveria ter sido vinculado)`);
      encontradosNaApi++;
    } else {
      console.log(`   ❌ ${ata.nup} - NÃO EXISTE na API (registro manual)`);
      naoEncontradosNaApi++;
    }
  }

  console.log(`\n📈 Resumo:`);
  console.log(`   Registros locais que EXISTEM na API: ${encontradosNaApi}`);
  console.log(`   Registros locais que NÃO EXISTEM na API: ${naoEncontradosNaApi}`);

  await prisma.$disconnect();
}

checkSync().catch(console.error);
