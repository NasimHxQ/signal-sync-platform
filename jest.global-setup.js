const { execSync } = require('child_process')
const path = require('path')

module.exports = async () => {
  // Use a dedicated SQLite file for tests in project root
  // We want a clean, migrated schema every run to match dev schema
  const projectRoot = process.cwd()

  // Ensure DATABASE_URL for prisma CLI is directed at test.db for this setup step only
  const env = {
    ...process.env,
    DATABASE_URL: 'file:./test.db',
  }

  try {
    // 1) Push the current prisma schema to the test DB
    execSync('npx prisma db push', {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
    })

    // 2) Optionally seed minimal baseline data if you want parity with dev
    // Commented out by default to keep tests deterministic from per-suite setup
    // execSync('npx tsx prisma/seed.ts', { cwd: projectRoot, stdio: 'inherit', env })
  } catch (err) {
    // Surface errors clearly in Jest output
    console.error('Global test DB setup failed:', err?.message || err)
    throw err
  }
}


