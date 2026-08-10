import pytesseract
from PIL import Image
from pypdf import PdfReader
from docx import Document
import io
import requests

def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF file bytes."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def parse_image(file_bytes: bytes) -> str:
    """Extract text from Image file bytes using OCR."""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error parsing Image: {e}")
        return ""

def parse_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX file bytes."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print(f"Error parsing DOCX: {e}")
        return ""

def ocr_space_parse(filename: str, file_bytes: bytes) -> str:
    """Fallback OCR using free OCR.Space API"""
    try:
        payload = {'apikey': 'helloworld', 'language': 'eng'}
        files = {'file': (filename, file_bytes)}
        r = requests.post('https://api.ocr.space/parse/image', files=files, data=payload, timeout=30)
        result = r.json()
        parsed_text = ""
        for item in result.get("ParsedResults", []):
            parsed_text += item.get("ParsedText", "") + "\n"
            
        if not parsed_text.strip() and result.get("IsErroredOnProcessing"):
            print("OCR.Space Error:", result.get("ErrorMessage"))
            return ""
            
        return parsed_text
    except Exception as e:
        print(f"OCR API Exception: {e}")
        return ""

def parse_document(filename: str, file_bytes: bytes) -> str:
    """Determine file type and parse accordingly."""
    filename = filename.lower()
    if filename.endswith(".pdf"):
        text = parse_pdf(file_bytes)
        if not text or len(text.strip()) < 20:
            print("PDF lacks text. Falling back to OCR.Space API...")
            text = ocr_space_parse(filename, file_bytes)
        return text
    elif filename.endswith(".docx"):
        return parse_docx(file_bytes)
    elif filename.endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
        return ocr_space_parse(filename, file_bytes)
    else:
        return "Unsupported file format."
