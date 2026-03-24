import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Generated hash for "admin123":');
  console.log(hashedPassword);
}

generateHash();
