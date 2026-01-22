const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Verifica se já existe um usuário admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@supel.gov.br' }
  });

  if (existingAdmin) {
    console.log('Usuário admin já existe no banco de dados.');
    return;
  }

  // Cria o usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@supel.gov.br',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    }
  });

  console.log('Usuário admin criado com sucesso:');
  console.log({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  });
}

main()
  .catch((e) => {
    console.error('Erro ao criar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
