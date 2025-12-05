import React, { useState } from 'react';
import styles from '../Style/FAQs.module.css';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <button 
        className={styles.question} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {question}
        <span className={`${styles.icon} ${isOpen ? styles.iconRotated : ''}`}>
          ▼
        </span>
      </button>
      <div className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}>
        <div className={styles.answerContent}>
            {answer}
        </div>
      </div>
    </div>
  );
};

const FAQs = () => {
  const creatorFAQs = [
    {
      question: "How do I start a campaign?",
      answer: "Starting a campaign is easy! Click on the '+ Create' button in your dashboard. You'll need to provide details such as your campaign title, description, funding goal, and upload a cover image. Once you submit, your campaign will be live immediately."
    },
    {
      question: "What are the fees involved?",
      answer: "Bayanihan Drive is committed to helping you maximize your funds. We charge a small platform fee of 5% on donations to cover operational costs and payment processing fees. This is automatically deducted from the donations you receive."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "You can request a withdrawal from the 'My Wallet' section in your dashboard. Click 'Withdraw', enter the amount and your bank details. Withdrawals are typically processed within 2-3 business days."
    },
    {
      question: "Can I edit my campaign after publishing?",
      answer: "Yes, you can edit your campaign details at any time. Go to 'My Campaigns', select the campaign you wish to edit, and click the 'Edit' button. However, you cannot change the funding goal once you have received donations."
    },
    {
      question: "How long can a campaign run?",
      answer: "Campaigns do not have a strict time limit, but we recommend setting a realistic duration to create a sense of urgency. Most successful campaigns run for 30 to 60 days."
    }
  ];

  const donorFAQs = [
    {
      question: "How do I donate to a campaign?",
      answer: "Browse the 'Home Feed' to find a campaign that resonates with you. Click on the campaign card to view details, then click the 'Donate' button. You can choose an amount and pay securely via our payment partners."
    },
    {
      question: "Is my donation secure?",
      answer: "Absolutely. We use industry-standard encryption and secure payment gateways to process all transactions. Your financial information is never stored on our servers."
    },
    {
      question: "Can I donate anonymously?",
      answer: "Yes, when making a donation, you have the option to hide your name from the public donor list. However, the campaign organizer will still be able to see your details for gratitude purposes."
    },
    {
      question: "How do I track my donations?",
      answer: "You can view all your past donations in the 'My Donations' section of your dashboard. This provides a history of who you've supported and the amount contributed."
    },
    {
      question: "Can I get a refund?",
      answer: "Donations are generally non-refundable as they are often immediately used by campaign organizers for their causes. If you believe there has been an error or fraudulent activity, please contact our support team immediately."
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>Find answers to common questions about Bayanihan Drive</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Campaign Creators</h2>
        {creatorFAQs.map((faq, index) => (
          <FAQItem key={`creator-${index}`} question={faq.question} answer={faq.answer} />
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Donors</h2>
        {donorFAQs.map((faq, index) => (
          <FAQItem key={`donor-${index}`} question={faq.question} answer={faq.answer} />
        ))}
      </section>
    </div>
  );
};

export default FAQs;
