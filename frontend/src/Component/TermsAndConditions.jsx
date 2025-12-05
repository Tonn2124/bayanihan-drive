import React from 'react';
import styles from '../Style/TermsAndConditions.module.css';

export default function TermsAndConditions({ onBack }) {
  return (
    <div className={styles.container}>
      <div className={styles.bgCircle1}></div>
      <div className={styles.bgCircle2}></div>

      <div className={styles.card}>
        <div className={styles.header}>
            <h1 className={styles.title}>Terms and Conditions</h1>
            <p className={styles.subtitle}>Last Updated: June 2024</p>
        </div>

        <div className={styles.content}>
            <section>
                <h3>1. Introduction</h3>
                <p>Welcome to Bayanihan Drive. By accessing our website and using our services, you agree to be bound by the following terms and conditions.</p>
            </section>

            <section>
                <h3>2. User Accounts</h3>
                <p>To use certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
            </section>

            <section>
                <h3>3. Donations and Campaigns</h3>
                <p>Bayanihan Drive acts as a platform to connect donors with campaigns. We do not guarantee the accuracy of any campaign information and are not responsible for the use of funds by campaign organizers.</p>
            </section>

            <section>
                <h3>4. Prohibited Conduct</h3>
                <p>You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, impairs, or renders the service less efficient.</p>
            </section>
            
             <section>
                <h3>5. Intellectual Property</h3>
                <p>All content included on the website, such as text, graphics, logos, images, is the property of Bayanihan Drive or its content suppliers and protected by copyright laws.</p>
            </section>

             <section>
                <h3>6. Limitation of Liability</h3>
                <p>Bayanihan Drive shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits.</p>
            </section>

            <section>
                <h3>7. Changes to Terms</h3>
                <p>We reserve the right to modify these terms at any time. You should check this page regularly. Your continued use of the service after any such change constitutes your acceptance of the new Terms and Conditions.</p>
            </section>
        </div>

        <div className={styles.footer}>
            <button className={styles.backBtn} onClick={onBack}>
                Back to Login/Signup
            </button>
        </div>
      </div>
    </div>
  );
}
