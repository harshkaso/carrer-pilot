-- Write a query returning every application with company name, job title, and current status.
SELECT 
    applications.id,
    job_postings.company,
    job_postings.title AS job_title,
    applications.status
FROM applications
JOIN users
    ON applications.user_id = users.id
JOIN job_postings
    on applications.job_posting_id = job_postings.id;
