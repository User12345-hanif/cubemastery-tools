// Scramble-generator FAQ structured data. Previously shipped in the static
// index.html shell, where it was attached to every route; it now belongs
// exclusively to the scramble-generator route (see ScrambleGenerator.jsx).
export const SCRAMBLE_FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a Rubik's Cube scramble?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A scramble is a sequence of moves, written in standard cube notation, that takes a solved cube to a randomized state. Each letter refers to a face of the cube: U (up), D (down), R (right), L (left), F (front) and B (back). A letter on its own means a 90-degree clockwise turn, an apostrophe means counter-clockwise, and a 2 means a half turn. On bigger cubes, moves like Rw or Uw turn two layers at once."
      }
    },
    {
      "@type": "Question",
      "name": "How do I use a scramble generator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick your puzzle size, then hold the cube with the white face up and the green face toward you. Apply the moves from left to right exactly as written. Once the cube is scrambled, start the timer, solve, and stop the timer when you finish. Generate a new scramble for every solve so your practice reflects a realistic range of positions."
      }
    },
    {
      "@type": "Question",
      "name": "Why use WCA scrambles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The World Cube Association (WCA) defines the scrambling standards used in official speedcubing competitions. Practicing with WCA-style scrambles means every solve starts from a fair, unbiased position with no wasted or redundant moves, so your times at home are directly comparable to competition results and to times posted by other cubers around the world."
      }
    }
  ]
}
