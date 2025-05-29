from flask import Flask, request, jsonify
import fitz  # PyMuPDF for PDFs
from docx import Document
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF."""
    try:
        doc = fitz.open(pdf_path)
        text = "\n".join(page.get_text("text") for page in doc)
        return text.strip()
    except Exception as e:
        return f"Error processing PDF: {str(e)}"

def extract_text_from_docx(docx_path):
    """Extract text from a Word DOCX file."""
    try:
        doc = Document(docx_path)
        text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
        return text.strip()
    except Exception as e:
        return f"Error processing DOCX: {str(e)}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"})

    ext = file.filename.split(".")[-1].lower()
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    extracted_text = ""
    if ext == "pdf":
        extracted_text = extract_text_from_pdf(filepath)
    elif ext == "docx":
        extracted_text = extract_text_from_docx(filepath)
    else:
        return jsonify({"success": False, "error": "Unsupported file format"})
    
    return jsonify({"success": True, "text": extracted_text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
