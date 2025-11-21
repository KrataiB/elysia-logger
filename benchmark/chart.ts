import { spawn } from 'child_process'
import { writeFileSync } from 'fs'

const DURATION = '5s'
const CONNECTIONS = '100'
const THREADS = '10'

const targets = [
    { name: 'Baseline', script: 'benchmark/server-baseline.ts', port: 3002 },
    { name: 'Elysia Logger', script: 'benchmark/server-elysia-logger.ts', port: 3000 },
    { name: 'Logixlysia', script: 'benchmark/server-logixlysia.ts', port: 3001 }
]

async function runBenchmark(target: typeof targets[0]) {
    console.log(`Starting ${target.name}...`)
    
    // Start server
    const server = spawn('bun', ['run', target.script], {
        stdio: 'ignore', // Ignore stdout/stderr to avoid noise
        detached: false
    })

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`Running wrk against ${target.name}...`)
    
    // Run wrk
    const wrk = spawn('wrk', [
        '-t', THREADS,
        '-c', CONNECTIONS,
        '-d', DURATION,
        `http://localhost:${target.port}`
    ])

    let output = ''
    wrk.stdout.on('data', (data) => { output += data.toString() })

    await new Promise<void>((resolve) => {
        wrk.on('close', () => {
            server.kill()
            resolve()
        })
    })

    // Parse Requests/sec
    const match = output.match(/Requests\/sec:\s+([\d\.]+)/)
    const reqsPerSec = match ? parseFloat(match[1]) : 0
    
    console.log(`${target.name}: ${reqsPerSec} req/sec`)
    return { name: target.name, reqsPerSec }
}

async function main() {
    const results = []
    
    for (const target of targets) {
        results.push(await runBenchmark(target))
        // Cool down
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('Generating chart...')

    const chartConfig = {
        type: 'bar',
        data: {
            labels: results.map(r => r.name),
            datasets: [{
                label: 'Requests/sec',
                data: results.map(r => r.reqsPerSec),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)', // Blue
                    'rgba(75, 192, 192, 0.5)', // Green
                    'rgba(255, 99, 132, 0.5)'  // Red
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Logger Performance Benchmark'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }

    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=800&height=400&backgroundColor=white`
    
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    
    writeFileSync('benchmark/results.png', Buffer.from(buffer))
    console.log('Chart saved to benchmark/results.png')
}

main().catch(console.error)
