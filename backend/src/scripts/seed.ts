import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user (replace with your wallet address)
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS || 'YourAdminWalletAddressHere';
  
  const admin = await prisma.admin.upsert({
    where: { walletAddress: adminWallet },
    update: {},
    create: {
      walletAddress: adminWallet,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Admin created:', admin);

  // Example: Create a test project (optional)
  // const testUser = await prisma.user.upsert({
  //   where: { walletAddress: 'TestWalletAddress' },
  //   update: {},
  //   create: { walletAddress: 'TestWalletAddress' },
  // });

  // const testProject = await prisma.project.create({
  //   data: {
  //     name: 'Example Project',
  //     symbol: 'EXAMPLE',
  //     description: 'This is an example project for testing',
  //     tokenAddress: 'ExampleTokenAddress',
  //     tokenMint: 'ExampleTokenMint',
  //     submittedBy: testUser.id,
  //     status: 'APPROVED',
  //   },
  // });

  // console.log('Test project created:', testProject);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

