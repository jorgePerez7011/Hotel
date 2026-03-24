import bcrypt from 'bcryptjs';

async function generateHashCarmens() {
  const password = 'carmen123';
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Hash para "carmen123":');
  console.log(hashedPassword);
}

generateHashCarmens();
