'use client'

import { useEffect, useState } from 'react'

export default function TestFetch() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch('http://localhost:8080/recipes/filter')
            .then(res => {
                if (!res.ok) throw new Error('Error en la respuesta del backend')
                return res.json()
            })
            .then(data => setData(data))
            .catch(err => setError(err.message))
    }, [])

    return (
        <div>
            <h1>Prueba de conexión Backend</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
}