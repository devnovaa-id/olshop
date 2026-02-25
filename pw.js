const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 12

async function main() {
  const password = process.argv[2]

  if (!password) {
    console.log('Gunakan: node pw.js <password>')
    process.exit(1)
  }

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    console.log('Password asli :', password)
    console.log('Hash bcrypt   :', hashed)
  } catch (err) {
    console.error('Terjadi kesalahan:', err.message)
  }
}

main()