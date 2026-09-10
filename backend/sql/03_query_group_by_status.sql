-- Write a query returning the number of applications grouped by status.

SELECT
  status,
  COUNT(*) AS application_count
FROM applications
GROUP BY status
ORDER BY application_count DESC;
