# SWTOR Influence Calculator

This application helps players of Star Wars: The Old Republic (SWTOR) determine the most efficient way to increase their companion's influence level. By selecting a companion, a starting influence level, and a target level, the calculator provides the exact number of gifts of different rarities (Artifact, Prototype, and Premium) needed to reach the desired influence.

## Features

- **Companion Selection**: Choose from a list of available SWTOR companions.
- **Level Range**: Define your current influence level and your target level.
- **Gift Calculation**: Instantly calculates the number of Artifact, Prototype, and Premium gifts required.
- **Total XP**: See the total experience points needed for the selected level range.
- **Optimal Gifts**: The calculator shows the specific best-loved gifts for each rarity for the chosen companion.

## Tech Stack

This project is built with a modern web stack:

- **Next.js**: React framework for production.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **ShadCN UI**: A collection of re-usable UI components.

## Data Source

All companion gift preferences and influence level data are sourced from publicly available information, primarily from SWTOR fan sites like [swtorista.com](https://swtorista.com/). The calculations assume the character has the **Legacy of Altruism III** perk, which grants a +30% bonus to influence gained from companion gifts.
