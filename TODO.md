# Synapia Mail - TODO List

## MVP Features

### Core Fixes and Improvements
- [ ] Fix threshold for UI that does not work
- [ ] Categories are not stored in database - save them when a new one is created
- [ ] Category is not passed through the AI backend to help categorize
- [ ] AI backend is missing a database to save configuration

### Subscription System
- [ ] Create a microservice to handle subscriptions (UI for customer and backend + Stripe + database - Postgres for this)

### Administration System
- [ ] Administration frontend + backend for Synapia to manage its customers
- [ ] Customer should be part of organization - implement organization management (in administration for Synapia)
- [ ] Credit should be handled by subscription + pool of credit - organization admin page to manage credit across organization
- [ ] Multiple roles should be available for an organization ('admin' & 'user')

### User Management
- [ ] Parameter page should allow to also change user informations (mail, name, surname, change password)
- [ ] Forget password functionality

### Email Integration
- [ ] Test and make the Outlook connection work with also the key vault
- [ ] Find a way to get a trigger to analyze new email (maybe put a webhook in place)

## Future Features

### Advanced Email Features
- [ ] Automatic email response in draft of the mailbox

### Knowledge Management
- [ ] Document database knowledge management

### Other
- [ ] ... (additional features to be defined)
