#!/usr/bin/env python3
"""
Backend API Testing for SlideForge PPT Generator
Tests all authentication and presentation endpoints
"""

import requests
import sys
import time
import json
from datetime import datetime

class SlideForgeAPITester:
    def __init__(self, base_url="https://outline-ppt.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = None
        self.presentation_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        self.log("\n=== AUTHENTICATION TESTS ===")
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@example.com", "password": "admin123"}
        )
        
        if success:
            self.user_data = response
            self.log(f"   Logged in as: {response.get('email')} (Role: {response.get('role')})")
        else:
            self.log("❌ Admin login failed - stopping auth tests")
            return False

        # Test /auth/me endpoint
        success, me_data = self.run_test(
            "Get Current User (/auth/me)",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            self.log(f"   User data: {me_data.get('email')} - {me_data.get('name')}")
        
        # Test user registration
        test_email = f"test_{int(time.time())}@example.com"
        success, reg_response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": test_email, "password": "testpass123", "name": "Test User"}
        )
        
        if success:
            self.log(f"   Registered user: {reg_response.get('email')}")
        
        # Test logout
        success, _ = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        
        # Login back as admin for presentation tests
        success, _ = self.run_test(
            "Re-login as Admin",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@example.com", "password": "admin123"}
        )
        
        return success

    def test_presentation_generation(self):
        """Test presentation generation flow"""
        self.log("\n=== PRESENTATION GENERATION TESTS ===")
        
        # Start generation
        test_prompt = "Create a pitch deck for an AI-powered fitness app"
        success, response = self.run_test(
            "Start Presentation Generation",
            "POST",
            "presentations/generate",
            200,
            data={"prompt": test_prompt}
        )
        
        if not success:
            self.log("❌ Failed to start generation - stopping presentation tests")
            return False
        
        self.presentation_id = response.get('id')
        self.log(f"   Generation started with ID: {self.presentation_id}")
        
        # Poll for completion (max 30 seconds)
        max_polls = 20
        poll_count = 0
        
        while poll_count < max_polls:
            time.sleep(1.5)
            poll_count += 1
            
            success, pres_data = self.run_test(
                f"Poll Status (attempt {poll_count})",
                "GET",
                f"presentations/{self.presentation_id}",
                200
            )
            
            if success:
                status = pres_data.get('status')
                step = pres_data.get('step', 0)
                total_steps = pres_data.get('total_steps', 5)
                self.log(f"   Status: {status} (Step {step}/{total_steps})")
                
                if status == "completed":
                    slides = pres_data.get('slides', [])
                    self.log(f"   ✅ Generation completed! {len(slides)} slides created")
                    self.log(f"   Title: {pres_data.get('title', 'N/A')}")
                    return True
                elif status == "failed":
                    error = pres_data.get('error', 'Unknown error')
                    self.log(f"   ❌ Generation failed: {error}")
                    return False
        
        self.log("❌ Generation timed out after 30 seconds")
        return False

    def test_presentation_management(self):
        """Test presentation listing and management"""
        self.log("\n=== PRESENTATION MANAGEMENT TESTS ===")
        
        if not self.presentation_id:
            self.log("❌ No presentation ID available - skipping management tests")
            return False
        
        # List presentations
        success, presentations = self.run_test(
            "List Presentations",
            "GET",
            "presentations",
            200
        )
        
        if success:
            self.log(f"   Found {len(presentations)} presentations")
            if presentations:
                latest = presentations[0]
                self.log(f"   Latest: {latest.get('title', 'N/A')} ({latest.get('status')})")
        
        # Get specific presentation
        success, pres_data = self.run_test(
            "Get Specific Presentation",
            "GET",
            f"presentations/{self.presentation_id}",
            200
        )
        
        if success:
            slides = pres_data.get('slides', [])
            self.log(f"   Presentation has {len(slides)} slides")
            if slides:
                self.log(f"   First slide: {slides[0].get('title', 'N/A')}")
        
        return success

    def test_file_downloads(self):
        """Test PPTX and PDF download endpoints"""
        self.log("\n=== FILE DOWNLOAD TESTS ===")
        
        if not self.presentation_id:
            self.log("❌ No presentation ID available - skipping download tests")
            return False
        
        # Test PPTX download
        try:
            url = f"{self.base_url}/api/presentations/{self.presentation_id}/download/pptx"
            response = self.session.get(url)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                content_length = len(response.content)
                self.log(f"✅ PPTX Download - Status: 200, Size: {content_length} bytes")
                self.log(f"   Content-Type: {content_type}")
                self.tests_passed += 1
            else:
                self.log(f"❌ PPTX Download - Status: {response.status_code}")
            
            self.tests_run += 1
        except Exception as e:
            self.log(f"❌ PPTX Download - Error: {str(e)}")
            self.tests_run += 1
        
        # Test PDF download
        try:
            url = f"{self.base_url}/api/presentations/{self.presentation_id}/download/pdf"
            response = self.session.get(url)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                content_length = len(response.content)
                self.log(f"✅ PDF Download - Status: 200, Size: {content_length} bytes")
                self.log(f"   Content-Type: {content_type}")
                self.tests_passed += 1
            else:
                self.log(f"❌ PDF Download - Status: {response.status_code}")
            
            self.tests_run += 1
        except Exception as e:
            self.log(f"❌ PDF Download - Error: {str(e)}")
            self.tests_run += 1

    def test_presentation_deletion(self):
        """Test presentation deletion"""
        self.log("\n=== PRESENTATION DELETION TEST ===")
        
        if not self.presentation_id:
            self.log("❌ No presentation ID available - skipping deletion test")
            return False
        
        success, _ = self.run_test(
            "Delete Presentation",
            "DELETE",
            f"presentations/{self.presentation_id}",
            200
        )
        
        if success:
            self.log(f"   Presentation {self.presentation_id} deleted successfully")
        
        return success

    def test_error_cases(self):
        """Test error handling"""
        self.log("\n=== ERROR HANDLING TESTS ===")
        
        # Test invalid login
        success, _ = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@example.com", "password": "wrongpass"}
        )
        
        # Test empty prompt generation
        success, _ = self.run_test(
            "Empty Prompt Generation",
            "POST",
            "presentations/generate",
            400,
            data={"prompt": ""}
        )
        
        # Test non-existent presentation
        success, _ = self.run_test(
            "Non-existent Presentation",
            "GET",
            "presentations/non-existent-id",
            404
        )

    def run_all_tests(self):
        """Run all test suites"""
        self.log("🚀 Starting SlideForge API Tests")
        self.log(f"Backend URL: {self.base_url}")
        
        start_time = time.time()
        
        # Run test suites
        auth_success = self.test_auth_flow()
        
        if auth_success:
            gen_success = self.test_presentation_generation()
            if gen_success:
                self.test_presentation_management()
                self.test_file_downloads()
                self.test_presentation_deletion()
        
        self.test_error_cases()
        
        # Print summary
        duration = time.time() - start_time
        self.log(f"\n📊 TEST SUMMARY")
        self.log(f"Tests run: {self.tests_run}")
        self.log(f"Tests passed: {self.tests_passed}")
        self.log(f"Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log(f"Duration: {duration:.1f}s")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SlideForgeAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())