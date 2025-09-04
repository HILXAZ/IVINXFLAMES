import app from './app.js'

const port = process.env.PORT || 5174
app.listen(port, () => console.log(`Breathing API running on http://localhost:${port}`))
