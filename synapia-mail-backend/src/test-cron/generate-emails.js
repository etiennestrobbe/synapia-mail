const fs = require('fs');
const path = require('path');

// Email templates by category
const templates = {
  work: {
    subjects: [
      'Meeting Request for {date}',
      'Project Update: {project}',
      'Budget Review Q{quarter}',
      'Client Presentation - {company}',
      'Team Building Event',
      'Performance Review',
      'New Hire Onboarding',
      'System Maintenance Notice',
      'Policy Update',
      'Quarterly Report'
    ],
    bodies: [
      'Dear team, I would like to schedule a meeting to discuss {topic}. Please let me know your availability.',
      'The {project} is progressing well. We have completed {percentage}% and expect to finish by {date}.',
      'Please review the attached budget proposal for Q{quarter}. Your feedback is requested by {date}.',
      'Our presentation to {company} is scheduled for {date}. Please prepare your slides accordingly.',
      'We are organizing a team building event on {date}. RSVP by {deadline} if you plan to attend.'
    ],
    senders: [
      'manager@company.com',
      'hr@company.com',
      'ceo@company.com',
      'project.manager@company.com',
      'it.support@company.com',
      'finance@company.com',
      'marketing@company.com'
    ]
  },
  personal: {
    subjects: [
      'Dinner Plans',
      'Weekend Getaway',
      'Birthday Reminder',
      'Family Reunion',
      'Concert Tickets',
      'Book Recommendation',
      'Recipe Share',
      'Travel Plans',
      'Movie Night',
      'Coffee Catch-up'
    ],
    bodies: [
      'Hey! Want to grab dinner this week? I found this great new restaurant downtown.',
      'Are you free this weekend? I was thinking we could go hiking or see a movie.',
      'Just a reminder that {person}\'s birthday is coming up on {date}. Should we plan something?',
      'The family reunion is scheduled for {date} at Grandma\'s house. Hope you can make it!',
      'I got tickets to the {artist} concert next month. Want to come with me?'
    ],
    senders: [
      'mom@gmail.com',
      'dad@hotmail.com',
      'sister@yahoo.com',
      'brother@gmail.com',
      'bestfriend@gmail.com',
      'cousin@outlook.com'
    ]
  },
  spam: {
    subjects: [
      'WIN A FREE IPHONE NOW!!!',
      'You Have Won $1,000,000!',
      'URGENT: Your Account Has Been Hacked',
      'Cheap Viagra - 90% Off',
      'Work From Home - Make $5000/Day',
      'Prince From Nigeria Needs Your Help',
      'Your Package Is Waiting',
      'Credit Card Approval',
      'Investment Opportunity',
      'Weight Loss Secret'
    ],
    bodies: [
      'Congratulations! You have been selected as our lucky winner. Click here to claim your prize!',
      'Dear Customer, We have detected unusual activity on your account. Please verify immediately.',
      'Limited time offer! Get the best deals on our premium products. Don\'t miss out!',
      'Make money from home! No experience required. Start earning today with our proven system.',
      'You have a package waiting for pickup. Please provide your information to arrange delivery.'
    ],
    senders: [
      'winner@lottery.com',
      'support@paypal-security.com',
      'deals@amazon-discount.com',
      'noreply@spamdomain.com',
      'admin@urgent-notification.com'
    ]
  },
  urgent: {
    subjects: [
      'EMERGENCY: Server Down',
      'CRITICAL: Data Breach',
      'URGENT: Payment Overdue',
      'ALERT: Security Incident',
      'PRIORITY: Contract Deadline',
      'CRITICAL: System Failure',
      'URGENT: Legal Notice',
      'EMERGENCY: Medical Alert',
      'CRITICAL: Financial Issue',
      'URGENT: Time Sensitive'
    ],
    bodies: [
      'CRITICAL ALERT: Our main production server has gone down. All services are affected. IT team is working on it urgently.',
      'SECURITY BREACH: We have detected unauthorized access to our systems. All passwords must be changed immediately.',
      'URGENT: Your payment of ${amount} is overdue. Please settle immediately to avoid service disruption.',
      'EMERGENCY: There has been a security incident. Please change all passwords and enable 2FA immediately.',
      'CRITICAL: The contract deadline is approaching. We need your immediate approval to proceed.'
    ],
    senders: [
      'alert@company.com',
      'security@company.com',
      'urgent@company.com',
      'critical@company.com',
      'emergency@support.com'
    ]
  }
};

// Helper function to get random element from array
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to replace placeholders
function replacePlaceholders(text) {
  return text
    .replace(/{date}/g, () => {
      const dates = ['Monday', 'tomorrow', 'next week', 'Friday', 'next month'];
      return randomElement(dates);
    })
    .replace(/{project}/g, () => {
      const projects = ['Website Redesign', 'Mobile App', 'Database Migration', 'API Development', 'UI/UX Update'];
      return randomElement(projects);
    })
    .replace(/{quarter}/g, () => Math.floor(Math.random() * 4) + 1)
    .replace(/{company}/g, () => {
      const companies = ['TechCorp', 'Global Solutions', 'Innovate Ltd', 'Future Systems', 'NextGen Inc'];
      return randomElement(companies);
    })
    .replace(/{topic}/g, () => {
      const topics = ['project status', 'budget planning', 'team restructuring', 'new initiatives', 'process improvements'];
      return randomElement(topics);
    })
    .replace(/{percentage}/g, () => Math.floor(Math.random() * 100) + 1)
    .replace(/{person}/g, () => {
      const people = ['Mom', 'Dad', 'your sister', 'your brother', 'your best friend'];
      return randomElement(people);
    })
    .replace(/{artist}/g, () => {
      const artists = ['Taylor Swift', 'Ed Sheeran', 'The Rolling Stones', 'Bruno Mars', 'Adele'];
      return randomElement(artists);
    })
    .replace(/{amount}/g, () => Math.floor(Math.random() * 5000) + 500)
    .replace(/{deadline}/g, () => {
      const deadlines = ['tomorrow', 'end of day', 'next week', 'by Friday', 'ASAP'];
      return randomElement(deadlines);
    });
}

// Generate emails for a category
function generateEmailsForCategory(category, count) {
  const emails = [];
  const template = templates[category];

  for (let i = 0; i < count; i++) {
    const subject = replacePlaceholders(randomElement(template.subjects));
    const body = replacePlaceholders(randomElement(template.bodies));
    const from = randomElement(template.senders);

    emails.push({
      subject,
      body,
      from
    });
  }

  return emails;
}

// Generate all emails
const allEmails = {
  work: generateEmailsForCategory('work', 300),
  personal: generateEmailsForCategory('personal', 200),
  spam: generateEmailsForCategory('spam', 150),
  urgent: generateEmailsForCategory('urgent', 100),
  marketing: generateEmailsForCategory('work', 150), // Reuse work templates for marketing
  misc: generateEmailsForCategory('personal', 100)   // Reuse personal templates for misc
};

// Write to files
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

Object.entries(allEmails).forEach(([category, emails]) => {
  const filename = `${category}-emails.json`;
  const filepath = path.join(dataDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(emails, null, 2));
  console.log(`Generated ${emails.length} emails for ${category} -> ${filename}`);
});

console.log('Email generation complete!');
