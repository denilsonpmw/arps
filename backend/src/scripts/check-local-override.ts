import { prisma } from '../lib/prisma';

async function checkLocalOverride() {
  console.log('=== TESTE: local_override ===\n');

  // 1. Contar registros com arpNumero
  const comArp = await prisma.ata.count({
    where: { arpNumero: { not: null } }
  });

  // 2. Contar com local_override=true
  const comOverride = await prisma.ata.count({
    where: { local_override: true }
  });

  console.log(`📊 Registros com arpNumero preenchido: ${comArp}`);
  console.log(`🔒 Registros com local_override=true: ${comOverride}`);

  // 3. Verificar consistência
  const atasComArp = await prisma.ata.findMany({
    where: { arpNumero: { not: null } },
    select: { nup: true, arpNumero: true, local_override: true }
  });

  console.log('\n✅ Registros com arpNumero:');
  for (const ata of atasComArp.slice(0, 5)) {
    console.log(`   ${ata.nup} | ARP: ${ata.arpNumero} | Override: ${ata.local_override}`);
  }
  if (atasComArp.length > 5) {
    console.log(`   ... e mais ${atasComArp.length - 5} registros`);
  }

  // 4. Verificar se todos com arpNumero têm local_override=true
  const inconsistentes = atasComArp.filter(a => !a.local_override);
  if (inconsistentes.length > 0) {
    console.log(`\n⚠️  ATENÇÃO: ${inconsistentes.length} registros com arpNumero mas local_override=false`);
  } else {
    console.log('\n✅ CONSISTENTE: Todos os registros com arpNumero têm local_override=true');
  }

  await prisma.$disconnect();
}

checkLocalOverride().catch(console.error);
