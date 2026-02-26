@echo off
echo ====================================================
echo ShopEase API Test Runner (Postman / Newman)
echo ====================================================

echo Installing Newman and HTML Reporter globally (if not installed)...
call npm install -g newman newman-reporter-htmlextra

echo.
echo Running Automated API Test Suite...
echo.

call newman run "postman_collections\ShopEase API Tests.postman_collection.json" ^
  -e "postman_environments\local.postman_environment.json" ^
  --reporters cli,htmlextra ^
  --reporter-htmlextra-export docs\ShopEase_API_Test_Report.html

echo.
echo ====================================================
echo Test run complete! 
echo A detailed HTML report has been generated at: docs\ShopEase_API_Test_Report.html
echo ====================================================
