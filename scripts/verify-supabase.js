import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

// Simple .env parser since we don't have dotenv
let env = {}
try {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            env[key.trim()] = value.trim()
        }
    })
} catch (e) {
    console.log('Could not read .env file at:', envPath)
}

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

console.log('Testing connection to:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)

    if (error) {
        console.error('Connection Failed:', error.message)
        process.exit(1)
    } else {
        console.log('Connection Successful!')
        console.log('Profiles found:', data.length)
        if (data.length > 0) {
            console.log('First profile:', data[0])
        }
        process.exit(0)
    }
}

testConnection()
