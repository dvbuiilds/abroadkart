# AbroadKart

Welcome to AbroadKart, your one-stop platform for fulfilling all your study abroad needs. Whether you’re exploring universities, seeking expert counseling, managing documentation, or navigating the application process, AbroadKart is here to guide you every step of the way.

This project is built using Next.js, a powerful framework for building modern web applications.

## Features Checklist

Below is the checklist of services provided by AbroadKart. These features are currently under development and will be available soon:

- [ ] **Counseling:** Personalized guidance from experts to help you choose the right path.
- [ ] **Explore Universities & Countries:** Discover universities and programs tailored to your preferences.
- [ ] **Compilation & Documentation:** Assistance with compiling necessary documents like SOPs, LORs, and transcripts.
- [ ] **Application Process:** Step-by-step support in submitting applications to your chosen institutions.
- [ ] **Fees & Finance:** Guidance on tuition fees, scholarships, and financial planning.
- [ ] **Post Selection Support:** Help with visa applications, accommodation, and pre-departure preparations.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in the root directory.

`MONGODB_URI` - the complete url of your mongo db cloud cluster url that should include username, password (with escape characters if any), db name.

`ENVIRONMENT` - either 'development' or 'production'.

## Getting Started

To set up the development environment for AbroadKart, follow these steps:

**1. Clone the Repository**

```bash
git clone https://github.com/your-repo/abroadkart.git
cd abroadkart
```

**2. Install Dependencies**

Install the required packages using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
```

**3. Start the Development Server**

Run the development server locally:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Once started, open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Editing & Development

- The homepage can be edited in `pages/index.tsx`. Any changes made to this file will automatically reflect in the browser due to Next.js’s hot reloading feature.
- API routes are located in the `pages/api` directory. For example:
- The `/api/hello` route maps to `pages/api/hello.ts`.
- These routes can be used to implement backend logic for features like user authentication, form submissions, etc.

## Deployment

The recommended platform for deploying AbroadKart is Vercel, which offers seamless integration with Next.js. To deploy:

    1.	Push your code to a GitHub/GitLab/Bitbucket repository.
    2.	Connect your repository to Vercel.
    3.	Vercel will automatically build and deploy your application.

For detailed instructions, refer to the Next.js deployment documentation.

## Learn More

To learn more about Next.js and its features, check out these resources:

- Next.js Documentation: Comprehensive guide on Next.js features and APIs.
- Learn Next.js: Interactive tutorial for beginners.
- Next.js GitHub Repository: Explore examples and contribute to the open-source project.

## Contributing

We welcome contributions to AbroadKart! If you’d like to contribute:

    1.	Fork this repository.
    2.	Create a new branch (`git checkout -b feature-name`).
    3.	Commit your changes (`git commit -m "Add feature"`).
    4.	Push to the branch (`git push origin feature-name`).
    5.	Open a Pull Request.

## Contact Us

For any queries or support related to AbroadKart, feel free to reach out at:

- Email: [support@abroadkart.com](mailto:support@abroadkart.com)
- Website: [www.abroadkart.com](www.abroadkart.com)

This ReadMe serves as a starting point for understanding and contributing to AbroadKart. We’re excited to help candidates achieve their dreams of studying abroad!
