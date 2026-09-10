-- Write a query returning companies with more than two applications.
SELECT
    job_postings.company,
    COUNT(applications.id) AS application_count
FROM applications
JOIN job_postings
    ON applications.job_posting_id = job_postings.id
GROUP BY job_postings.company
HAVING COUNT(applications.id) > 2
ORDER BY application_count DESC;
