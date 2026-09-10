-- Write a query returning the most recently added job for each company.

-- We will need a timestamp on job_postings.

ALTER TABLE job_postings
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Now the query can use created_at

SELECT DISTINCT ON (company)
    id,
    company,
    title,
    url,
    created_at
FROM job_postings
ORDER BY company, created_at DESC;

-- DSTINCT ON is PostgreSQL specific

-- PORTABLE SQL Approach
SELECT
    id,
    company,
    title,
    url,
    created_at
FROM (
    SELECT
        id,
        company,
        title,
        url,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY company
            ORDER BY created_at DESC
        ) AS row_num
    FROM job_postings
) jobs
WHERE row_num = 1;