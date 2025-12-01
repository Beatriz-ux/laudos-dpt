import { PrismaClient, AppRole, Department } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (opcional - remova se não quiser limpar)
  console.log('🧹 Limpando dados existentes...');
  await prisma.userRole.deleteMany();
  await prisma.profile.deleteMany();

  // Criar senha criptografada
  const password = await bcrypt.hash('senha123', 10);

  // Criar usuário AGENT
  console.log('👤 Criando usuário AGENT...');
  const agent = await prisma.profile.create({
    data: {
      username: 'agente.silva',
      email: 'agente@dpt.ba.gov.br',
      password: password,
      name: 'João Silva',
      department: Department.TRAFFIC,
      badge: 'AGT-001',
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: agent.id,
      role: AppRole.AGENT,
    },
  });

  console.log(`✅ AGENT criado: ${agent.name} (${agent.email})`);

  // Criar usuário OFFICER
  console.log('👮 Criando usuário OFFICER...');
  const officer = await prisma.profile.create({
    data: {
      username: 'policial.santos',
      email: 'policial@dpt.ba.gov.br',
      password: password,
      name: 'Maria Santos',
      department: Department.CRIMINAL,
      badge: 'POL-001',
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: officer.id,
      role: AppRole.OFFICER,
    },
  });

  console.log(`✅ OFFICER criado: ${officer.name} (${officer.email})`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('─────────────────────────────────────');
  console.log('AGENTE:');
  console.log(`  Email: ${agent.email}`);
  console.log('  Senha: senha123');
  console.log('─────────────────────────────────────');
  console.log('POLICIAL:');
  console.log(`  Email: ${officer.email}`);
  console.log('  Senha: senha123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
