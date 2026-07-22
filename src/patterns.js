export const PATTERNS = [
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    algorithm: 'M2 E2 S2',
    description:
      'The most famous cube pattern of all. Every face shows a checkerboard of two opposite ' +
      'colors, created with just three slice half-turns. Repeat the algorithm to return to a ' +
      'solved cube.',
  },
  {
    id: 'superflip',
    name: 'Superflip',
    algorithm: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
    description:
      'Every edge is flipped in place while every corner stays solved. The superflip was the ' +
      'first position proven to require 20 moves, helping establish that "God\'s number" for ' +
      'the 3\u00d73 is exactly 20.',
  },
  {
    id: 'cube-in-cube',
    name: 'Cube in Cube',
    algorithm: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    description:
      'Creates the illusion of a smaller 2\u00d72 cube embedded in one corner of the puzzle, ' +
      'rotated against the rest. A favorite for photos and showing off smooth turning.',
  },
  {
    id: 'anaconda',
    name: 'Anaconda',
    algorithm: "L U B' U' R L' B R' F B' D R D' F'",
    description:
      'A snake of color winds its way around all six faces of the cube, like an anaconda ' +
      'wrapped around the puzzle. Related to the Python and Green Mamba snake patterns.',
  },
  {
    id: 'crosses',
    name: 'Crosses',
    algorithm: "R2 L' D F2 R' D' R' L U' D R D B2 R' U D2",
    description:
      'Draws a plus-shaped cross on every face of the cube, with each cross wearing a border ' +
      'of a different color. A clean, symmetric pattern that looks great from every angle.',
  },
]
