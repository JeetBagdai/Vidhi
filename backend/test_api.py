import requests
import os

API_URL = "http://localhost:8000"

def test_contract_upload():
    # create dummy pdf
    with open("test_contract.pdf", "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/Name /F1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(This is a sample contract for Vidhi.) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000244 00000 n\n0000000334 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n429\n%%EOF")
        
    print("Testing PDF Upload...")
    try:
        with open("test_contract.pdf", "rb") as f:
            files = {"file": ("test_contract.pdf", f, "application/pdf")}
            response = requests.post(f"{API_URL}/contracts/analyze", files=files)
            print(f"Status Code: {response.status_code}")
            print("Response:", response.json())
    except Exception as e:
        print(f"PDF Test Failed: {e}")

if __name__ == "__main__":
    test_contract_upload()
