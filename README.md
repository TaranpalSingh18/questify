# Questify

Questify is a gamified B2B crowdsourcing platform that connects businesses with global talent to solve mission-critical challenges collaboratively. The platform leverages gamification mechanics, collaboration tools, and a reputation system to drive engagement and innovation.
Note: Questify is currently in the development stage, and many features are yet to be added.
## Features

- **Quest Management**: Businesses can post quests (challenges) with rewards.
- **Talent Engagement**: Individuals or teams can participate in quests and submit solutions.
- **Gamification**: Points, leaderboards, and achievements to motivate participants.
- **Collaboration Tools**: Built-in communication and teamwork features.
- **Reputation System**: Users build credibility through successful quest completions.
- **Secure Transactions**: Ensures fair payouts and secure interactions.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Cloud Storage**: TBD
- **Hosting**: TBD

## Setup Instructions

### Prerequisites
Ensure you have the following installed:
- Node.js (v18+ recommended)
- MongoDB
- Git

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/TaranpalSingh18/questify.git
   cd questify
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

## Contributing
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature-name`).
5. Open a Pull Request.

## Roadmap
- [ ] Implement quest submission review system
- [ ] Add payment integration for rewards
- [ ] Enhance the reputation and ranking system
- [ ] Mobile-friendly UI improvements
