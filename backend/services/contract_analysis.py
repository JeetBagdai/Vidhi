
import re
from typing import List, Dict, Any

class ContractAnalyzer:
    """
    Basic rule-based analyzer for Phase 1.
    """
    
    RISK_RULES = [
        {
            "category": "Indemnity",
            "keywords": ["indemnify", "indemnification", "hold harmless"],
            "high_risk_terms": ["unlimited", "all claims", "any and all"],
            "suggestion": "Cap liability to contract value or fixed amount."
        },
        {
            "category": "Termination",
            "keywords": ["terminate", "termination", "cancellation"],
            "high_risk_terms": ["immediate", "without cause", "at any time"],
            "suggestion": "Ensure mutual termination rights and at least 30 days notice."
        },
        {
            "category": "Liability",
            "keywords": ["liability", "liable", "limitation of liability"],
            "high_risk_terms": ["indirect", "consequential", "punitive", "no limit"],
            "suggestion": "Exclude consequential damages and cap direct liability."
        },
        {
            "category": "Jurisdiction",
            "keywords": ["jurisdiction", "governing law", "courts of"],
            "high_risk_terms": ["exclusive", "foreign", "arbitration"],
            "suggestion": "Ensure jurisdiction is in a convenient location (e.g., India)."
        },
        {
            "category": "Payment",
            "keywords": ["payment", "invoice", "fees"],
            "high_risk_terms": ["net 60", "net 90", "discretion"],
            "suggestion": "Negotiate for Net 30 or Net 15 payment terms."
        }
    ]

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyzes contract text to identify clauses and risks.
        """
        clauses = self._split_into_clauses(text)
        flagged_issues = []
        total_risk_weight = 0
        
        for clause in clauses:
            issue = self._evaluate_clause(clause)
            if issue:
                flagged_issues.append(issue)
                if issue['risk'] == 'High':
                    total_risk_weight += 10
                elif issue['risk'] == 'Medium':
                    total_risk_weight += 5
                else:
                    total_risk_weight += 2

        # Normalize score (0 to 100, where 0 is safest, 100 is riskiest)
        # But UI expects high score = high risk? Or high score = Safety?
        # Let's assume High Score = High Risk.
        # Cap at 100.
        risk_score = min(total_risk_weight, 100)
        
        # Invert for "Safety Score" if needed, but UI shows "Risk Score".
        # Let's return Risk Score directly.
        
        return {
            "risk_score": risk_score,
            "clauses_analyzed": len(clauses),
            "flagged_issues": flagged_issues
        }

    def _split_into_clauses(self, text: str) -> List[str]:
        """
        Splits text into paragraphs/clauses.
        """
        # Basic split by double newline or numbered lists
        # Clean up text
        text = re.sub(r'\s+', ' ', text).strip()
        # Regex to split by something looking like a new clause start (e.g., "1.", "2.1", "SECTION")
        # For now, just split by "." followed by space for sentence/clause level, or use paragraphs if preserved.
        # Since OCR returns text with newlines, let's treat newlines as separators if possible.
        # But the parser utility joined pages.
        # Let's simple split by ". " for granular analysis.
        return [s.strip() for s in text.split('. ') if len(s.strip()) > 20]

    def _evaluate_clause(self, text: str) -> Dict[str, str] | None:
        text_lower = text.lower()
        
        for rule in self.RISK_RULES:
            # Check if clause belongs to category
            if any(k in text_lower for k in rule['keywords']):
                # Check for high risk terms
                risk_level = "Low"
                if any(t in text_lower for t in rule['high_risk_terms']):
                    risk_level = "High"
                elif len(text) > 500: # Overly long rules
                    risk_level = "Medium"
                
                # If risk found (even low, we flag categorized clauses for review)
                # But to avoid noise, maybe only flag High/Medium?
                # Let's flag all identified categories.
                
                return {
                    "clause": rule['category'],
                    "text_snippet": text[:100] + "...",
                    "risk": risk_level,
                    "suggestion": rule['suggestion']
                }
        return None
