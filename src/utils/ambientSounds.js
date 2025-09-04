import { Howl } from 'howler'

const sounds = {
  rain: new Howl({ src: ['/sounds/rain.mp3'], loop: true, volume: 0.4 }),
  ocean: new Howl({ src: ['/sounds/ocean.mp3'], loop: true, volume: 0.4 }),
  forest: new Howl({ src: ['/sounds/forest.mp3'], loop: true, volume: 0.4 })
}

let current = null

export function playAmbient(name) {
  stopAmbient()
  const s = sounds[name]
  if (s) {
    current = s
    s.play()
  }
}

export function stopAmbient() {
  if (current) {
    current.stop()
    current = null
  }
}
