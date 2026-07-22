"""
Receipt Scanner Service
Uses Tesseract OCR to extract text from receipt images,
then Google Gemini (free) to parse the text into structured data and categorize.
"""
import json
import logging
import requests
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from django.conf import settings
from .models import Category
from stores.models import KnownStore

logger = logging.getLogger(__name__)

# Set Tesseract executable path from settings (required on Windows)
if hasattr(settings, 'TESSERACT_CMD') and settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


def preprocess_image(image_file):
    """
    Preprocess receipt image for better OCR accuracy.
    - Convert to grayscale
    - Increase contrast
    - Apply sharpening
    - Binarize with adaptive threshold
    """
    image_file.seek(0)
    img = Image.open(image_file)
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    
    # Increase sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)
    
    # Sharpen filter
    img = img.filter(ImageFilter.SHARPEN)
    
    # Binarize — helps with noisy receipt photos
    threshold = 140
    img = img.point(lambda x: 255 if x > threshold else 0, '1')
    img = img.convert('L')  # back to grayscale for Tesseract
    
    return img


def extract_text_from_image(image_file):
    """
    Use Tesseract OCR to extract text from a receipt image.
    Tries multiple OCR configurations for best results.
    """
    img = preprocess_image(image_file)
    
    # Try with auto page segmentation and rotation detection first
    configs = [
        ('deu+eng', r'--oem 3 --psm 1'),  # Auto with rotation detection
        ('deu+eng', r'--oem 3 --psm 6'),  # Assume uniform block of text
        ('eng', r'--oem 3 --psm 6'),       # English only fallback
    ]
    
    best_text = ''
    for lang, config in configs:
        try:
            text = pytesseract.image_to_string(img, lang=lang, config=config)
            if len(text.strip()) > len(best_text):
                best_text = text.strip()
        except Exception as e:
            logger.warning(f"OCR config ({lang}, {config}) failed: {e}")
            continue
    
    return best_text


def get_categories_list():
    """Get all available categories as a list of dicts."""
    return list(Category.objects.values('id', 'name', 'description'))


def detect_grocery_store(ocr_text):
    """
    Check if OCR text contains a known store name from DB.
    Uses OCR variant matching to handle common OCR errors.
    Also checks store name directly (case-insensitive) in case
    OCR variants list doesn't cover all possibilities.
    Returns (store_name, category, group_label) tuple or (None, None, None).
    """
    # Normalize: collapse whitespace, strip special chars for fuzzy matching
    text_lower = ocr_text.lower()
    # Also create a version with non-alphanumeric stripped for fuzzy matching
    import re
    text_stripped = re.sub(r'[^a-z0-9\s]', '', text_lower)
    
    stores = KnownStore.objects.select_related('category').all()
    for store in stores:
        # Check official OCR variants
        for variant in store.get_variants_list():
            if variant in text_lower:
                return store.name, store.category, store.group_label
        # Also check store name directly (handles cases like OCR reading it correctly)
        if store.name.lower() in text_lower or store.name.lower() in text_stripped:
            return store.name, store.category, store.group_label
    
    # Last resort: check first 5 lines — store name is usually at the top
    first_lines = '\n'.join(text_lower.split('\n')[:5])
    for store in stores:
        if store.name.lower() in first_lines:
            return store.name, store.category, store.group_label
    
    return None, None, None


def parse_receipt_with_gemini(ocr_text, categories, image_base64=None, image_mime=None):
    """
    Use Google Gemini (free tier) to parse receipt data.
    Sends both OCR text and the original image for better recognition.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in settings.")

    categories_text = "\n".join([
        f"- id={cat['id']}, name=\"{cat['name']}\", description=\"{cat['description'] or ''}\""
        for cat in categories
    ])

    prompt = f"""Analyze this receipt image and the OCR text below. Extract structured data.

OCR TEXT (may have errors):
---
{ocr_text}
---

AVAILABLE EXPENSE CATEGORIES:
{categories_text}

Extract and return a JSON object with these fields:
1. "seller" - store/vendor name (string or null)
2. "date" - payment date in YYYY-MM-DD format (string or null)
3. "total" - total amount as a number without currency symbol (number or null)
4. "currency" - detected currency code like "RUB", "USD", "EUR" (string or null)
5. "items" - array of purchased items, each with:
   - "name": item description (string)
   - "price": price as a number (number)
   - "quantity": quantity, default 1 (number)
6. "suggested_category_id" - the best matching category ID from the list above (number)
7. "suggested_category_name" - the name of the suggested category (string)
8. "confidence" - how confident you are in the category match: "high", "medium", or "low" (string)

Choose the most appropriate category based on the store type and items.
Use the IMAGE to read the store logo/name even if OCR missed it.
If the text is unreadable or not a receipt, set confidence to "low" and fill what you can.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text."""

    # Build request parts — include image if available
    parts = [{"text": prompt}]
    if image_base64 and image_mime:
        parts.insert(0, {
            "inline_data": {
                "mime_type": image_mime,
                "data": image_base64
            }
        })

    # Try multiple models in case of quota limits
    models = ['gemini-3.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']

    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1500,
        }
    }

    last_error = None
    for model_idx, model in enumerate(models):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        try:
            # Retry with backoff for rate limits
            # First model gets more retries (it's the most reliable)
            import time
            max_retries = 4 if model_idx == 0 else 2
            response = None
            for attempt in range(max_retries):
                response = requests.post(url, json=payload, timeout=45)
                if response.status_code in (429, 503):
                    delay = 3 * (attempt + 1)  # 3s, 6s, 9s, 12s
                    logger.warning(f"Model {model} returned {response.status_code}, retry {attempt+1}/{max_retries} in {delay}s...")
                    time.sleep(delay)
                else:
                    break
            
            response.raise_for_status()

            data = response.json()
            
            # Handle cases where Gemini returns no content
            candidates = data.get('candidates', [])
            if not candidates:
                logger.warning(f"Model {model}: no candidates in response")
                last_error = ValueError("Gemini returned no candidates")
                continue
            
            parts = candidates[0].get('content', {}).get('parts', [])
            if not parts or not parts[0].get('text'):
                logger.warning(f"Model {model}: empty response text")
                last_error = ValueError("Gemini returned empty text")
                continue
            
            result_text = parts[0]['text'].strip()
            logger.info(f"Gemini raw response (first 200 chars): {result_text[:200]}")

            # Clean up response - remove markdown code blocks if present
            if result_text.startswith("```"):
                result_text = result_text.split("\n", 1)[1]
                if result_text.endswith("```"):
                    result_text = result_text[:-3]
                result_text = result_text.strip()

            result = json.loads(result_text)

            # Validate category ID exists
            category_ids = [cat['id'] for cat in categories]
            if result.get('suggested_category_id') not in category_ids:
                if categories:
                    result['suggested_category_id'] = categories[0]['id']
                    result['suggested_category_name'] = categories[0]['name']
                    result['confidence'] = 'low'
                else:
                    result['suggested_category_id'] = None
                    result['suggested_category_name'] = None
                    result['confidence'] = 'low'

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}, text was: {result_text[:100]}")
            last_error = e
            continue
        except requests.exceptions.HTTPError as e:
            # If rate limited (429), not found (404), or server overloaded (503/500), try next model
            if response.status_code in (429, 404, 500, 503):
                logger.warning(f"Model {model} failed ({response.status_code}), trying next...")
                last_error = e
                continue
            logger.error(f"Gemini API HTTP error: {e} - {response.text}")
            raise
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            last_error = e
            continue

    # All models failed
    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


def scan_receipt(image_file):
    """
    Full receipt scanning pipeline:
    1. Tesseract OCR to extract text
    2. Gemini Vision to parse image + text and categorize
    
    Args:
        image_file: An uploaded image file (InMemoryUploadedFile)
    
    Returns:
        dict with parsed receipt data including suggested category
    """
    import base64
    
    # Step 0: Read image bytes for Gemini Vision
    image_file.seek(0)
    image_bytes = image_file.read()
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    # Determine MIME type
    image_mime = getattr(image_file, 'content_type', 'image/jpeg') or 'image/jpeg'
    
    # Step 1: OCR with Tesseract
    ocr_text = extract_text_from_image(image_file)
    
    logger.info(f"OCR extracted text (first 200 chars): {ocr_text[:200]}")
    
    if not ocr_text or len(ocr_text.strip()) < 5:
        raise ValueError(
            "Could not recognize text in the image. "
            "Try taking a photo with better lighting and focus."
        )
    
    # Step 2: Get categories from DB
    categories = get_categories_list()
    
    # Step 2.5: Check if OCR text contains a known store — if so, extract basic info
    store_name, store_category, group_label = detect_grocery_store(ocr_text)
    
    # Step 3: Parse with Gemini AI (free) - send image + OCR text
    gemini_text = ocr_text[:2000] if len(ocr_text) > 2000 else ocr_text
    try:
        result = parse_receipt_with_gemini(gemini_text, categories, image_base64, image_mime)
    except (RuntimeError, ValueError) as e:
        logger.warning(f"Gemini parsing failed: {e}")
        # If Gemini fails but we detected a store, return basic result
        if store_name:
            # Try to extract total with regex
            import re
            total = None
            # Match patterns like "SUMME 12,34" or "Total 12.34" or "EUR 12,34"
            total_patterns = [
                r'(?:summe|total|gesamt|zu zahlen|eur)\s*[:\s]*(\d+[.,]\d{2})',
                r'(\d+[.,]\d{2})\s*(?:eur|€)',
            ]
            for pattern in total_patterns:
                match = re.search(pattern, ocr_text.lower())
                if match:
                    total = float(match.group(1).replace(',', '.'))
                    break
            
            result = {
                'seller': group_label or store_name,
                'date': None,
                'total': total,
                'currency': 'EUR',
                'items': [],
                'suggested_category_id': store_category.id if store_category else None,
                'suggested_category_name': store_category.name if store_category else None,
                'confidence': 'high',
                'detected_store': store_name,
                'ocr_text': ocr_text,
            }
            return result
        else:
            # No store detected and Gemini failed — return basic result with regex
            import re
            total = None
            total_patterns = [
                r'(?:summe|total|gesamt|zu zahlen|eur)\s*[:\s]*(\d+[.,]\d{2})',
                r'(\d+[.,]\d{2})\s*(?:eur|€)',
            ]
            for pattern in total_patterns:
                match = re.search(pattern, ocr_text.lower())
                if match:
                    total = float(match.group(1).replace(',', '.'))
                    break
            
            result = {
                'seller': None,
                'date': None,
                'total': total,
                'currency': 'EUR',
                'items': [],
                'suggested_category_id': categories[0]['id'] if categories else None,
                'suggested_category_name': categories[0]['name'] if categories else None,
                'confidence': 'low',
                'ocr_text': ocr_text,
            }
            return result
    
    # Step 4: Override with known store info if detected
    if not store_name and result.get('seller'):
        store_name, store_category, group_label = detect_grocery_store(result['seller'])
    if store_name:
        if store_category:
            result['suggested_category_id'] = store_category.id
            result['suggested_category_name'] = store_category.name
            result['confidence'] = 'high'
        # Set group_label as the expense name (e.g. "Supermarket total", "Drugstore total")
        result['seller'] = group_label or store_name
        # Flag for frontend to show confirmation prompt
        result['detected_store'] = store_name
    
    # Add raw OCR text for debugging/transparency
    result['ocr_text'] = ocr_text
    
    return result
