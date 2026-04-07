import pytesseract
from PIL import Image
from pypdf import PdfReader
import io

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

def parse_document(filename: str, file_bytes: bytes) -> str:
    """Determine file type and parse accordingly."""
    filename = filename.lower()
    if filename.endswith(".pdf"):
        return parse_pdf(file_bytes)
    elif filename.endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
        return parse_image(file_bytes)
    else:
        return "Unsupported file format."
